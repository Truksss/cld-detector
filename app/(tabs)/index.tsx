import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { CameraView, Camera as ExpoCamera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Buffer } from 'buffer';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Buffer as BufferPolyfill } from 'buffer';
global.Buffer = global.Buffer || BufferPolyfill;

// Define a type for the jpeg-js module
interface JpegModule {
  decode: (buffer: Buffer) => {
    width: number;
    height: number;
    data: Uint8Array;
  };
}

// Declare the jpeg variable with a specific type
let jpeg: JpegModule | null = null;
try {
  jpeg = require('jpeg-js') as JpegModule;
} catch (e) {
  console.warn('jpeg-js not loaded:', e);
}

// Since onnxruntime-react-native is causing issues, we'll import it conditionally
// and provide a mock implementation for type checking
let ort: any;
try {
  // More robust import approach
  const onnx = require('onnxruntime-react-native');
  if (onnx && typeof onnx === 'object') {
    ort = onnx;
    console.log("ONNX Runtime loaded successfully");
  } else {
    throw new Error("ONNX Runtime module loaded but with invalid format");
  }
} catch (e) {
  console.warn('ONNX Runtime not loaded:', e);
  // Mock implementation for development/testing
  ort = {
    InferenceSession: {
      create: async (path: string) => {
        console.log("Using mock ONNX session");
        return {
          run: async (feeds: any) => ({ output: ["Healthy Leaf"] })
        };
      }
    }
  };
}

// Define detection result type
interface Detection {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  class: string;
  score: number;
}

const CoffeeLeafDetection = () => {
  const [image, setImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [prediction, setPrediction] = useState<Detection[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await ExpoCamera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo && photo.uri) {  // Check that photo and photo.uri exist
          setCameraActive(false);
          setImage(photo.uri);
          setPrediction(null);
        } else {
          throw new Error("Photo data incomplete");
        }
      } catch (e) {
        console.error("Error taking picture: ", e);
        Alert.alert("Error", "Failed to take picture");
      }
    }
  };

  const selectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setImage(result.assets[0].uri);
      setPrediction(null);
    }
  };

  const imageToTensor = async (uri: string) => {
    try {
      // First resize the image to 640x640 which is typical for YOLO models
      const resizedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 640, height: 640 } }],
        { format: ImageManipulator.SaveFormat.JPEG }
      );
    
      console.log("Image resized successfully");
    
      // Read the image data
      const imgB64 = await FileSystem.readAsStringAsync(resizedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log("Image read as base64, length:", imgB64.length);
      
      // Check Buffer availability
      if (typeof Buffer === 'undefined') {
        console.error("Buffer is not defined");
        throw new Error("Buffer is not available");
      }
      
      const imgBuffer = Buffer.from(imgB64, 'base64');
      console.log("Buffer created from base64");
      
      // Check jpeg availability
      if (!jpeg) {
        console.error("jpeg-js module is not available");
        throw new Error("jpeg-js module is not available");
      }
      
      console.log("Attempting to decode JPEG, buffer size:", imgBuffer.length);
      // TypeScript null check with the non-null assertion operator (!)
      const rawImageData = jpeg!.decode(imgBuffer);
      console.log("JPEG decoded successfully, dimensions:", rawImageData.width, "x", rawImageData.height);
      
      // Rest of your function...
      const { width, height, data } = rawImageData;
      const buffer = new Float32Array(1 * 3 * 640 * 640);
    
      // Normalize and convert to CHW format
      let offset = 0;
      // For each channel (RGB)
      for (let c = 0; c < 3; c++) {
        for (let h = 0; h < 640; h++) {
          for (let w = 0; w < 640; w++) {
            const srcIdx = (h * width + w) * 4 + c;
            buffer[offset++] = data[srcIdx] / 255.0; // Normalize to 0-1
          }
        }
      }
    
      console.log("Tensor created successfully");
      
      return {
        data: buffer,
        dims: [1, 3, 640, 640], // NCHW format
        type: 'float32'  // Explicitly set the data type
      };
    } catch (error: unknown) {
      console.error("Detailed image conversion error:", error);
      if (error instanceof Error) {
        throw new Error("Failed to process image: " + error.message);
      } else {
        throw new Error("Failed to process image: Unknown error");
      }
    }
  };

// Process YOLO model output
const processYoloOutput = (results: any): Detection[] => {
  try {
    // Get the output tensor
    const outputTensor = results.output;
    
    if (!outputTensor) {
      console.error('Output tensor not found in results');
      return [];
    }
    
    // Get the data from the tensor
    const data = outputTensor.data || outputTensor;
    
    // Check if data is available
    if (!data || !data.length) {
      console.error('No data found in output tensor');
      return [];
    }
    
    // Class names for your coffee leaf disease model
    const classNames = ["Rust", "Sooty Mold", "Abiotic", "Cercospora"];
    const numClasses = classNames.length;
    
    const detections: Detection[] = [];
    
    // Log the first few entries to help debug format
    console.log("First 20 values of output:", Array.from(data).slice(0, 20));
    
    // Try to determine the format based on dimensions
    const dims = outputTensor.dims;
    console.log("Output dimensions:", dims);
    
    // Different handling based on model output format
    
    // YOLOv8 format: [batch, num_boxes, 4+1+num_classes]
    // The format is typically [batch, num_detections, (x,y,w,h,conf,class_scores...)]
    if (dims && dims.length >= 3) {
      const numDetections = dims[1];  // Second dimension is typically number of boxes
      const itemLen = dims[2];       // Third dimension is box data length
      
      console.log(`Processing ${numDetections} potential detections with ${itemLen} values each`);
      
      // Start with batch 0 (first image)
      for (let i = 0; i < numDetections; i++) {
        const baseIdx = i * itemLen;
        
        // YOLOv8 typically has confidence as the 5th value (after x,y,w,h)
        const confidenceIdx = 4;
        const confidence = data[baseIdx + confidenceIdx];
        
        // Filter low confidence detections
        if (confidence > 0.25) { // Confidence threshold
          let maxClassScore = 0;
          let maxClassIndex = 0;
          
          // Find the class with highest probability
          for (let c = 0; c < numClasses; c++) {
            const score = data[baseIdx + 5 + c];
            if (score > maxClassScore) {
              maxClassScore = score;
              maxClassIndex = c;
            }
          }
          
          // Check if class score is above threshold
          if (maxClassScore > 0.25) {
            // Extract bounding box coordinates
            const x = data[baseIdx];
            const y = data[baseIdx + 1];
            const width = data[baseIdx + 2];
            const height = data[baseIdx + 3];
            
            detections.push({
              box: {
                x: Math.max(0, Math.min(1, x)),
                y: Math.max(0, Math.min(1, y)),
                width: Math.max(0, Math.min(1, width)),
                height: Math.max(0, Math.min(1, height))
              },
              class: classNames[maxClassIndex],
              score: confidence * maxClassScore
            });
          }
        }
      }
    } 
    // YOLOv5 format which is often flattened
    else {
      console.log("Trying to parse flat output format");
      
      // Estimate the format - typically 5+num_classes values per detection
      const rowLength = 5 + numClasses;
      const numDetections = data.length / rowLength;
      
      if (numDetections > 0 && numDetections === Math.floor(numDetections)) {
        console.log(`Processing ${numDetections} potential detections`);
        
        for (let i = 0; i < numDetections; i++) {
          const baseIdx = i * rowLength;
          const confidence = data[baseIdx + 4];
          
          if (confidence > 0.25) {
            let maxClassScore = 0;
            let maxClassIndex = 0;
            
            for (let c = 0; c < numClasses; c++) {
              const score = data[baseIdx + 5 + c];
              if (score > maxClassScore) {
                maxClassScore = score;
                maxClassIndex = c;
              }
            }
            
            if (maxClassScore > 0.25) {
              const x = data[baseIdx] - data[baseIdx + 2] / 2;
              const y = data[baseIdx + 1] - data[baseIdx + 3] / 2;
              const width = data[baseIdx + 2];
              const height = data[baseIdx + 3];
              
              detections.push({
                box: {
                  x: Math.max(0, Math.min(1, x)),
                  y: Math.max(0, Math.min(1, y)),
                  width: Math.max(0, Math.min(1, width)),
                  height: Math.max(0, Math.min(1, height))
                },
                class: classNames[maxClassIndex],
                score: confidence * maxClassScore
              });
            }
          }
        }
      } else {
        console.error("Could not determine YOLO output format from data length");
      }
    }
    
    return detections;
  } catch (error) {
    console.error("Error processing YOLO output:", error);
    return [];
  }
};

  // Run the leaf disease detection
// Run the leaf disease detection
const runDetection = async () => {
  if (!image) return;
  
  setIsProcessing(true);
  
  try {
    // Path to the model in Android assets
    let modelPath: string;
    
    if (Platform.OS === 'android') {
      // For Android, we need to use the asset:/ protocol to access files in the assets directory
      const assetPath = 'asset:/best.onnx';
      const destPath = `${FileSystem.documentDirectory}best.onnx`;
      
      try {
        // Check if we've already copied the file
        const fileInfo = await FileSystem.getInfoAsync(destPath);
        
        if (!fileInfo.exists) {
          // Copy from assets to document directory (only if not already there)
          await FileSystem.copyAsync({
            from: assetPath,
            to: destPath
          });
        }
        
        modelPath = destPath;
      } catch (e) {
        console.error("Error accessing model file: ", e);
        Alert.alert("Model Error", "Could not access the model file. Check console for details.");
        setIsProcessing(false);
        return;
      }
    } else {
      // For iOS
      // You would need to include the model in the iOS bundle
      modelPath = `${FileSystem.bundleDirectory}best.onnx`;
    }
    
    console.log("Loading model from path:", modelPath);
    
    // Load the ONNX model
    const session = await ort.InferenceSession.create(modelPath);
    
    // Convert image to tensor format for the model
    console.log("Converting image to tensor...");
    const imageTensor = await imageToTensor(image);
    
    // Prepare input feeds for the model
    const feeds = {
      'images': imageTensor  // Make sure this matches your model's input name
    };
    
    // Run inference
    console.log("Running model inference...");
    const results = await session.run(feeds);
    console.log("Model inference complete");
    
    // Debug: Log the structure of results
    console.log("Results keys:", Object.keys(results));
    
    // Check if results is valid
    if (!results || typeof results !== 'object') {
      throw new Error("Invalid model output format");
    }
    
    // Try to find the output tensor - YOLO models may have different output names
    // Common names include 'output', 'output0', 'detection_output', etc.
    let outputTensor = null;
    const possibleOutputNames = ['output', 'output0', 'detection_output', 'detections', 'predictions'];
    
    for (const name of possibleOutputNames) {
      if (results[name]) {
        outputTensor = results[name];
        console.log(`Found output tensor with name: ${name}`);
        break;
      }
    }
    
    // If we didn't find it using common names, take the first available output
    if (!outputTensor && Object.keys(results).length > 0) {
      const firstKey = Object.keys(results)[0];
      outputTensor = results[firstKey];
      console.log(`Using first available output: ${firstKey}`);
    }
    
    if (!outputTensor) {
      throw new Error("Could not find output tensor in model results");
    }
    
    // Log info about the output tensor to help with debugging
    console.log("Output tensor shape:", outputTensor.dims || "No dims available");
    console.log("Output tensor type:", typeof outputTensor.data);
    console.log("Output tensor sample:", 
      Array.isArray(outputTensor.data) 
        ? outputTensor.data.slice(0, 5)
        : "Data not in expected format");
    
    // Process results with the identified output tensor
    const detections = processYoloOutput({ output: outputTensor });
    console.log("Detection results:", detections);
    
    setPrediction(detections);
    
    if (detections.length === 0) {
      // If no detections found, show a message
      Alert.alert('No Diseases Detected', 'No coffee leaf diseases were detected in this image.');
    }
  } catch (error) {
    console.error("Detection error:", error);
    Alert.alert('Detection Error', 'An error occurred during leaf analysis: ' + 
      (error instanceof Error ? error.message : "Unknown error"));
  } finally {
    setIsProcessing(false);
  }
};

  const resetCapture = () => {
    setImage(null);
    setPrediction(null);
  };

  // Camera view
  if (cameraActive) {
    if (cameraPermission === false) {
      return (
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1 justify-center items-center p-6">
            <Text className="text-red-600 text-lg font-bold mb-4">Camera permission not granted</Text>
            <Text className="text-gray-700 text-center mb-6">
              Please enable camera access in your device settings to use this feature.
            </Text>
            <TouchableOpacity 
              className="bg-blue-500 py-3 px-8 rounded-lg" 
              onPress={() => setCameraActive(false)}
            >
              <Text className="text-white font-medium">Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }
    
    // Using a combination of style and className to ensure proper rendering
    return (
      <View style={{ flex: 1 }}>
        <CameraView
          ref={cameraRef}
          style={{
            flex: 1,
            width: '100%',
            height: '100%'
          }}
          facing="back"
        />
        <View style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 32
        }}>
          <TouchableOpacity 
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#22c55e',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={takePicture}
          >
            <Ionicons name="checkmark" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#dc2626',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={() => setCameraActive(false)}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
        <StatusBar style="light" />
      </View>
    );
  }

  // Main UI
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-4">
        {/* Logo/Brand */}
        <View className="flex-row items-center mb-6">
          <Ionicons name="leaf" size={32} color="#2e7d32" />
          <Text className="text-2xl font-bold text-green-800 ml-2">BrewGuard</Text>
        </View>
        
        {/* Image Display Area */}
        <View className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
          {image ? (
            <View className="relative w-full h-full">
              <Image 
                source={{ uri: image }} 
                className="w-full h-full"
                resizeMode="cover"
              />
              {prediction && prediction.length > 0 && (
                <>
                  {/* Render bounding boxes */}
                  {prediction.map((det, idx) => {
                    const { x, y, width, height } = det.box;
                    return (
                      <View 
                        key={idx}
                        style={{
                          position: 'absolute',
                          left: `${x * 100}%`,
                          top: `${y * 100}%`,
                          width: `${width * 100}%`,
                          height: `${height * 100}%`,
                          borderWidth: 2,
                          borderColor: '#00ff00',
                        }}
                      >
                        <View style={{
                          backgroundColor: 'rgba(0,255,0,0.7)',
                          padding: 4,
                          position: 'absolute',
                          top: -24,
                          left: 0,
                        }}>
                          <Text style={{ color: 'white', fontWeight: 'bold' }}>
                            {det.class} ({(det.score * 100).toFixed(1)}%)
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                  
                  {/* Results summary at bottom */}
                  <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 py-2">
                    <Text className="text-white text-center font-bold text-lg">
                      {prediction.length === 1 
                        ? `Detected: ${prediction[0].class}`
                        : `Found: ${prediction.map(d => d.class).join(', ')}`}
                    </Text>
                  </View>
                </>
              )}
              {isProcessing && (
                <View className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-30 justify-center items-center">
                  <Text className="text-white font-bold text-lg">Processing...</Text>
                </View>
              )}
            </View>
          ) : (
            <View className="flex-1 justify-center items-center">
              <Ionicons name="leaf-outline" size={80} color="#ccc" />
              <Text className="text-gray-500 mt-2">No image selected</Text>
            </View>
          )}
        </View>
        
        {/* Action Buttons */}
        <View className="mb-6">
          {image ? (
            <View className="flex-row space-x-2">
              <TouchableOpacity 
                className="flex-1 bg-green-600 py-3 rounded-lg flex-row items-center justify-center"
                onPress={runDetection}
                disabled={isProcessing}
              >
                <Ionicons name="scan-outline" size={20} color="#fff" />
                <Text className="text-white font-medium ml-2">
                  {isProcessing ? "Analyzing..." : "Analyze Leaf"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-gray-600 py-3 rounded-lg flex-row items-center justify-center"
                onPress={resetCapture}
                disabled={isProcessing}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text className="text-white font-medium ml-2">Reset</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-3">
              <TouchableOpacity 
                className="bg-blue-600 py-3 rounded-lg flex-row items-center justify-center"
                onPress={() => setCameraActive(true)}
              >
                <Ionicons name="camera" size={20} color="#fff" />
                <Text className="text-white font-medium ml-2">Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-gray-600 py-3 rounded-lg flex-row items-center justify-center"
                onPress={selectImage}
              >
                <Ionicons name="image" size={20} color="#fff" />
                <Text className="text-white font-medium ml-2">Upload Image</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Guidelines */}
        <View className="bg-blue-50 p-4 rounded-lg">
          <Text className="font-bold text-blue-800 mb-2">Photo Guidelines:</Text>
          <View className="ml-2">
            <Text className="text-blue-800 mb-1">• Place a single leaf in the center of the frame</Text>
            <Text className="text-blue-800 mb-1">• Ensure good lighting conditions</Text>
            <Text className="text-blue-800 mb-1">• Keep the camera steady and close to the leaf</Text>
            <Text className="text-blue-800 mb-1">• Make sure the entire leaf is visible</Text>
            <Text className="text-blue-800 mb-1">• Avoid shadows covering important leaf features</Text>
          </View>
        </View>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default CoffeeLeafDetection;