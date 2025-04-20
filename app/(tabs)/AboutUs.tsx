import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Linking 
} from 'react-native';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: any;
  contact: {
    email: string;
    github: string;
    linkedin: string;
  };
}

const AboutUs = () => {
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Nico',
      role: 'Deep Learning Engineer',
      image: require('D:/CLD_Detector/assets/images/nico.jpg'), 
      contact: {
        email: 's2021100132@firstasia.edu.ph',
        github: 'https://github.com/cromcruach52',
        linkedin: 'https://www.linkedin.com/in/nicko-laygo-6a6548342/',
      },
    },
    {
      id: '2',
      name: 'Franco',
      role: 'Full Stack Developer',
      image: require('D:/CLD_Detector/assets/images/franco.jpg'), 
      contact: {
        email: 's2021102102@firstasia.edu.ph',
        github: 'https://github.com/FTsune',
        linkedin: 'https://www.linkedin.com/in/franco-miguel-villamor',
      },
    },
    {
      id: '3',
      name: 'Kurt',
      role: 'Full Stack Developer',
      image: require('D:/CLD_Detector/assets/images/kurt.jpg'), 
      contact: {
        email: 's2021102414@firstasia.edu.ph',
        github: 'https://github.com/Truksss',
        linkedin: 'https://www.linkedin.com/in/kurt-vincent-magcawas-099379247/',
      },
    },
    {
      id: '4',
      name: 'Marvin',
      role: 'Data Cleaner',
      image: require('D:/CLD_Detector/assets/images/marvin.jpg'), 
      contact: {
        email: 's2021106088@firstasia.edu.ph',
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
      },
    },
  ];

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  const sendEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch((err) => console.error('An error occurred', err));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerText}>Our Team</Text>
      
      <Text style={styles.subHeaderText}>
        The team behind BrewGuard
      </Text>
      
      <View style={styles.teamContainer}>
        {teamMembers.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <Image source={member.image} style={styles.profileImage} />
            
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberRole}>{member.role}</Text>
            
            <View style={styles.socialIcons}>

              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => sendEmail(member.contact.email)}
                activeOpacity={0.7}
              >
                <Image 
                  source={require('D:/CLD_Detector/assets/images/gmail.png')} 
                  style={styles.icon}
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => openLink(member.contact.github)}
                activeOpacity={0.7}
              >
                <Image 
                  source={require('D:/CLD_Detector/assets/images/github.png')} 
                  style={styles.icon}
                />
              </TouchableOpacity>
              
              
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => openLink(member.contact.linkedin)}
                activeOpacity={0.7}
              >
                <Image 
                  source={require('D:/CLD_Detector/assets/images/linkedin.png')} 
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
      
      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>About Our Project</Text>
        <Text style={styles.aboutText}>
         Secret
        </Text>
      </View>
    </ScrollView>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subHeaderText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  teamContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  memberCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImage: {
    width: 115,
    height: 160,
    borderRadius: 50,
    marginBottom: 20,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  memberRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  iconButton: {
    marginHorizontal: 8,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  aboutSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    textAlign: 'justify',
  },
});