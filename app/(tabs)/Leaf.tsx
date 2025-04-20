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

interface LeafData {
  id: string;
  name: string;
  image: any; 
  description: string;
}

const Leaf = () => {
  const [selectedLeaf, setSelectedLeaf] = useState<LeafData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const leafTypes: LeafData[] = [
    {
      id: '1',
      name: 'Arabica',
      image: require('D:/CLD_Detector/assets/leaves/arabica.jpg'),
      description: 'Coffea arabica, also known as the Arabica coffee, is a species of flowering plant in the coffee and madder family Rubiaceae. It is believed to be the first species of coffee to have been cultivated and is the dominant cultivar, representing about 60% of global production.',
    },
    {
      id: '2',
      name: 'Liberica',
      image: require('D:/CLD_Detector/assets/leaves/liberica.jpg'), 
      description: 'Coffea liberica, commonly known as the Liberian coffee, is a species of flowering plant in the family Rubiaceae from which coffee is produced. It is native to western and central Africa, and has become naturalised in areas including Colombia, Venezuela, the Philippines, Borneo and Java.',
    },
    {
      id: '3',
      name: 'Robusta',
      image: require('D:/CLD_Detector/assets/leaves/robusta.jpg'), 
      description: 'Coffea canephora is a species of coffee plant that has its origins in central and western sub-Saharan Africa. It is a species of flowering plant in the family Rubiaceae. Though widely known as Coffea robusta, the plant is scientifically identified as Coffea canephora, which has two main varieties, robusta and nganda.',
    },
  ];

  const handleCardPress = (leaf: LeafData) => {
    setSelectedLeaf(leaf);
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
    setTimeout(() => {
      setSelectedLeaf(null);
    }, 300);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.headerText}>Coffee Leaf Types</Text>
        
        <View style={styles.cardContainer}>
          {leafTypes.map((leaf) => (
            <TouchableOpacity 
              key={leaf.id} 
              style={styles.card}
              onPress={() => handleCardPress(leaf)}
              activeOpacity={0.8}
            >
              <Image source={leaf.image} style={styles.leafImage} />
              <Text style={styles.leafName}>{leaf.name}</Text>
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
          
          {selectedLeaf && (
            <SafeAreaView style={styles.modalContentWrapper}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedLeaf.name}</Text>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={handleClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.closeButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
                
                <Image source={selectedLeaf.image} style={styles.modalImage} />
                
                <View style={styles.descriptionContainer}>
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    scrollEventThrottle={16}
                    overScrollMode="never"
                  >
                    <Text style={styles.modalDescription}>{selectedLeaf.description}</Text>
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

export default Leaf;

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
  leafImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  leafName: {
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