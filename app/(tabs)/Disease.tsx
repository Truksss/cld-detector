import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  SafeAreaView
} from 'react-native';
import { BlurView } from 'expo-blur';

interface DiseaseData {
  id: string;
  name: string;
  image: any; 
  description: string;
}

const Disease = () => {
  const [selectedDisease, setSelectedDisease] = useState<DiseaseData | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const diseaseTypes: DiseaseData[] = [
      {
        id: '1',
        name: 'Abiotic Disorder',
        image: require('D:/CLD_Detector/assets/leaves/abiotic.jpg'),
        description: 'Abiotic disorders are caused by non-living environmental factors such as drought, temperature extremes, pollution, or nutrient deficiencies. These disorders often mimic the appearance of biotic diseases but are not caused by pathogens. Identifying abiotic stress is essential for effective crop management and long-term plant health.',
      },
      {
        id: '2',
        name: 'Cercospora',
        image: require('D:/CLD_Detector/assets/leaves/cercospora.jpg'), 
        description: 'This disease, also called Iron Spot, is caused by the fungal pathogen, Cercospora coffeicola and tends to present itself on coffee plants grown in areas of higher moisture and rainfall and on plants that are stressed.',
      },
      {
        id: '3',
        name: 'Rust',
        image: require('D:/CLD_Detector/assets/leaves/rust.jpg'), 
        description: 'Hemileia vastatrix is a multicellular basidiomycete fungus of the order Pucciniales that causes coffee leaf rust, a disease affecting the coffee plant. Coffee serves as the obligate host of coffee rust, that is, the rust must have access to and come into physical contact with coffee in order to survive.',
      },
      {
        id: '4',
        name: 'Sooty Mold',
        image: require('D:/CLD_Detector/assets/leaves/sooty.jpg'), 
        description: 'Sooty mold is a collective term for different Ascomycete fungi, which includes many genera, commonly Cladosporium and Alternaria. It grows on plants and their fruit, but also environmental objects, like fences, garden furniture, stones, and even cars.',
      },
    ];

    const handleCardPress = (disease: DiseaseData) => {
      setSelectedDisease(disease);
      setModalVisible(true);
    };

    const handleClose = () => {
      setModalVisible(false);
      setTimeout(() => {
        setSelectedDisease(null);
      }, 300);
    };

     return (
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.headerText}>Coffee Leaf Diseases</Text>
            
            <View style={styles.cardContainer}>
              {diseaseTypes.map((disease) => (
                <TouchableOpacity 
                  key={disease.id} 
                  style={styles.card}
                  onPress={() => handleCardPress(disease)}
                  activeOpacity={0.8}
                >
                  <Image source={disease.image} style={styles.diseaseImage} />
                  <Text style={styles.diseaseName}>{disease.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
    <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={handleClose}
          >
            <View style={styles.modalContainer}>
              {Platform.OS === 'ios' ? (
                <BlurView
                  style={StyleSheet.absoluteFill}
                  intensity={50}
                  tint="light"
                />
              ) : (
                <View style={[StyleSheet.absoluteFill, styles.androidBlurView]} />
              )}
              
              {selectedDisease && (
                <SafeAreaView style={styles.modalContentWrapper}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>{selectedDisease.name}</Text>
                      <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={handleClose}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.closeButtonText}>X</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <Image source={selectedDisease.image} style={styles.modalImage} />
                    
                    <View style={styles.descriptionContainer}>
                      <ScrollView 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        scrollEventThrottle={16}
                        overScrollMode="never"
                      >
                        <Text style={styles.modalDescription}>{selectedDisease.description}</Text>
                        <View style={styles.scrollPadding} />
                      </ScrollView>
                    </View>
                  </View>
                </SafeAreaView>
              )}
              
              <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.backdropTouchable} />
              </TouchableWithoutFeedback>
            </View>
          </Modal>
        </View>
      );
    };

export default Disease

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
    color:'#4D2605',
  },
  cardContainer: {
    width: '100%',
  },
  card: {
    width: '100%',
    backgroundColor: '#A4F9CB',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  diseaseImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
    textAlign: 'center',
    color:'#5E0000'
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  androidBlurView: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1, 
  },
  modalContentWrapper: {
    width: width * 0.9,
    maxHeight: height * 0.75,
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 1, 
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color:'#9D470A',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C22A2A',
    justifyContent: 'center',
    alignItems: 'center',
    color:'',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  descriptionContainer: {
    maxHeight: 250, 
  },
  scrollContent: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  scrollPadding: {
    height: 10,
  }
});