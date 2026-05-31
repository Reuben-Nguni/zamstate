import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, ActivityIndicator, Modal, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import { propertyService } from '../services/propertyService';
import { bookingService } from '../services/bookingService';
import { applicationService } from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';

export default function PropertyDetailScreen({ route, navigation }) {
  const { propertyId } = route.params || {};
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [applicationModalVisible, setApplicationModalVisible] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [applicationMessage, setApplicationMessage] = useState('I am interested in this property and would like to apply.');
  const [requesting, setRequesting] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const result = await propertyService.getPropertyById(propertyId);
        setProperty(result?.data || result || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [propertyId]);

  const handleBookingSubmit = async () => {
    if (!bookingDate || !bookingTime) {
      return Alert.alert('Missing details', 'Please enter both viewing date and time.');
    }
    try {
      setRequesting(true);
      await bookingService.createBooking({ propertyId, date: bookingDate, time: bookingTime, notes: 'Viewing request from mobile app' });
      Alert.alert('Booking requested', 'Your viewing request has been submitted.');
      setBookingModalVisible(false);
      setBookingDate('');
      setBookingTime('');
    } catch (err) {
      Alert.alert('Booking failed', err.message);
    } finally {
      setRequesting(false);
    }
  };

  const handleApplicationSubmit = async () => {
    if (!applicationMessage.trim()) {
      return Alert.alert('Message required', 'Please add a short application note.');
    }
    try {
      setRequesting(true);
      await applicationService.applyToProperty(propertyId, { message: applicationMessage.trim() });
      Alert.alert('Application sent', 'Your application has been submitted to the owner.');
      setApplicationModalVisible(false);
      setApplicationMessage('I am interested in this property and would like to apply.');
    } catch (err) {
      Alert.alert('Application failed', err.message);
    } finally {
      setRequesting(false);
    }
  };

  const handleContact = () => {
    const ownerName = `${property?.owner?.firstName || 'Owner'} ${property?.owner?.lastName || ''}`.trim();
    const ownerPhone = property?.owner?.phone;
    const ownerEmail = property?.owner?.email;

    if (ownerPhone) {
      Linking.openURL(`tel:${ownerPhone}`).catch(() => {
        Alert.alert('Contact owner', `Call ${ownerName} at ${ownerPhone}.`);
      });
      return;
    }

    if (ownerEmail) {
      Linking.openURL(`mailto:${ownerEmail}`).catch(() => {
        Alert.alert('Contact owner', `Email ${ownerName} at ${ownerEmail}.`);
      });
      return;
    }

    Alert.alert(
      'Contact owner',
      `Please request a viewing or application and the owner will be in touch. ${ownerName || 'The owner'} will receive your request.`
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E6F43" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Property not found.</Text>
      </SafeAreaView>
    );
  }

  const rawImages = property.images || property.photos || [];
  const host = API_BASE_URL.replace(/\/api\/?$/, '');
  const images = (rawImages && rawImages.length)
    ? rawImages
        .map((i) => {
          if (!i) return null;
          if (typeof i === 'string') {
            const url = i.startsWith('http') ? i : `${host}/${i.replace(/^\//, '')}`;
            return { url };
          }
          if (i.url) return { url: i.url.startsWith('http') ? i.url : `${host}/${i.url.replace(/^\//, '')}` };
          if (i.path) return { url: i.path.startsWith('http') ? i.path : `${host}/${i.path.replace(/^\//, '')}` };
          if (i.file) return { url: i.file.startsWith('http') ? i.file : `${host}/${i.file.replace(/^\//, '')}` };
          return null;
        })
        .filter(Boolean)
    : property.images?.[0]?.url
    ? [{ url: property.images[0].url }]
    : [];
  const isTenant = user?.role === 'tenant';

  const coordinates = property.location?.coordinates || property.location?.coords || property.location;
  const mapLat = coordinates?.lat || coordinates?.latitude;
  const mapLng = coordinates?.lng || coordinates?.longitude;
  const hasLocation = typeof mapLat === 'number' && typeof mapLng === 'number';
  const mapUrl = hasLocation
    ? `https://staticmap.openstreetmap.de/staticmap.php?center=${mapLat},${mapLng}&zoom=15&size=640x320&markers=${mapLat},${mapLng},red-pushpin`
    : null;

  const ownerName = `${property.owner?.firstName || 'Owner'} ${property.owner?.lastName || ''}`.trim();
  const ownerPhone = property.owner?.phone;
  const ownerEmail = property.owner?.email;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {images.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery} pagingEnabled>
            {images.map((img, index) => (
              <Image
                key={`property-image-${index}`}
                source={{ uri: img.url }}
                style={styles.image}
                resizeMode="cover"
                onError={() => setImageErrors((s) => ({ ...s, [index]: true }))}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyImage}>
            <Text style={styles.emptyLabel}>No images available</Text>
          </View>
        )}
        <View style={styles.body}>
          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.price}>{property.currency || 'ZMW'} {property.price || 'N/A'}</Text>
          <Text style={styles.type}>{property.type || 'Listing'}</Text>
          <Text style={styles.description}>{property.description || 'No description provided.'}</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.sectionText}>{property.location?.address || property.location?.township || 'Location details not available.'}</Text>
          </View>
          <View style={styles.mapCard}>
            <Text style={styles.sectionTitle}>Map</Text>
            {hasLocation && mapUrl && !mapFailed ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => Linking.openURL(`https://www.openstreetmap.org/?mlat=${mapLat}&mlon=${mapLng}#map=15/${mapLat}/${mapLng}`)}
              >
                <Image source={{ uri: mapUrl }} style={styles.mapImage} onError={() => setMapFailed(true)} />
                <View style={styles.mapOverlay}>
                  <Text style={styles.mapOverlayText}>Open interactive map</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.mapPlaceholder}>
                <Text style={styles.mapPlaceholderText}>{mapFailed ? 'Map failed to load' : 'Map location not available'}</Text>
              </View>
            )}
          </View>
          </View>
          <View style={styles.debugBlock}>
            <Text style={styles.sectionTitle}>Debug: resolved image URLs</Text>
            {images.length ? (
              images.map((it, i) => (
                <Text key={`dbg-img-${i}`} style={styles.debugText}>{i}: {it.url} {imageErrors[i] ? '(failed)' : ''}</Text>
              ))
            ) : (
              <Text style={styles.debugText}>no images resolved</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner</Text>
            <Text style={styles.sectionText}>{property.owner?.firstName || 'Owner'} {property.owner?.lastName || ''}</Text>
            <Text style={styles.sectionText}>{property.owner?.role ? property.owner.role.toUpperCase() : 'Owner'}</Text>
            {ownerPhone ? <Text style={styles.sectionText}>Phone: {ownerPhone}</Text> : null}
            {ownerEmail ? <Text style={styles.sectionText}>Email: {ownerEmail}</Text> : null}
          </View>
          <View style={styles.actionArea}>
            {user ? (
              <>
                <TouchableOpacity style={styles.primaryButton} onPress={() => setBookingModalVisible(true)}>
                  <Text style={styles.primaryButtonText}>Request viewing</Text>
                </TouchableOpacity>
                {isTenant && (
                  <TouchableOpacity style={styles.secondaryButton} onPress={() => setApplicationModalVisible(true)}>
                    <Text style={styles.secondaryButtonText}>Apply to property</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.primaryButtonText}>Sign in to book or apply</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
              <Text style={styles.contactButtonText}>Contact owner</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={bookingModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Book a viewing</Text>
            <TextInput style={styles.modalInput} placeholder="Viewing date (e.g. 2026-05-25)" value={bookingDate} onChangeText={setBookingDate} />
            <TextInput style={styles.modalInput} placeholder="Preferred time (e.g. 3:00 PM)" value={bookingTime} onChangeText={setBookingTime} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButtonPrimary} onPress={handleBookingSubmit} disabled={requesting}>
                <Text style={styles.modalButtonText}>{requesting ? 'Sending...' : 'Send request'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonLink} onPress={() => setBookingModalVisible(false)} disabled={requesting}>
                <Text style={styles.modalButtonLinkText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={applicationModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Apply for this property</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextarea]}
              multiline
              numberOfLines={4}
              placeholder="Write a short message to the owner"
              value={applicationMessage}
              onChangeText={setApplicationMessage}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButtonPrimary} onPress={handleApplicationSubmit} disabled={requesting}>
                <Text style={styles.modalButtonText}>{requesting ? 'Submitting...' : 'Submit application'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonLink} onPress={() => setApplicationModalVisible(false)} disabled={requesting}>
                <Text style={styles.modalButtonLinkText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 260,
  },
  gallery: {
    height: 260,
  },
  emptyImage: {
    width: '100%',
    height: 260,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyLabel: {
    color: '#777',
  },
  body: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E6F43',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 6,
  },
  type: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 18,
  },
  section: {
    marginBottom: 20,
  },
  mapCard: {
    marginBottom: 20,
  },
  mapImage: {
    width: '100%',
    height: 220,
    borderRadius: 18,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(30, 111, 67, 0.85)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  mapOverlayText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  mapPlaceholder: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    color: '#6B7280',
    fontSize: 15,
  },
  debugBlock: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  debugText: {
    color: '#444',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionText: {
    color: '#555',
    fontSize: 15,
    lineHeight: 22,
  },
  actionArea: {
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#1E6F43',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#1E6F43',
    fontWeight: '700',
    fontSize: 16,
  },
  contactButton: {
    borderColor: '#1E6F43',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#1E6F43',
    fontWeight: '700',
    fontSize: 16,
  },
  errorText: {
    margin: 20,
    fontSize: 16,
    color: '#B00020',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E6F43',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#FBFBFB',
  },
  modalTextarea: {
    height: 110,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: '#1E6F43',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  modalButtonLink: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonLinkText: {
    color: '#1E6F43',
    fontWeight: '700',
  },
});
