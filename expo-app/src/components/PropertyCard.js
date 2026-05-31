import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { API_BASE_URL } from '../services/api';

function resolveImageUrl(item, host) {
  if (!item) return null;
  if (typeof item === 'string') return item.startsWith('http') ? item : `${host}/${item.replace(/^\//, '')}`;
  if (item.url) return item.url.startsWith('http') ? item.url : `${host}/${item.url.replace(/^\//, '')}`;
  if (item.path) return item.path.startsWith('http') ? item.path : `${host}/${item.path.replace(/^\//, '')}`;
  if (item.file) return item.file.startsWith('http') ? item.file : `${host}/${item.file.replace(/^\//, '')}`;
  return null;
}

export default function PropertyCard({ property, onPress }) {
  const host = API_BASE_URL.replace(/\/api\/?$/, '');
  const rawImages = property.images || property.photos || [];
  const thumbnail = (rawImages && rawImages.length) ? resolveImageUrl(rawImages[0], host) : resolveImageUrl(property.image || property.thumbnail || property.photo, host);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Quick debug log for unresolved image issues
    console.log('PropertyCard images for', property._id || property.id || property.title, rawImages, '=>', thumbnail);
  }, [property]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {thumbnail && !failed ? (
        <Image source={{ uri: thumbnail }} style={styles.image} onError={() => setFailed(true)} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{failed ? 'Image failed to load' : 'No image'}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title}>{property.title || 'Untitled property'}</Text>
        <Text numberOfLines={2} style={styles.description}>{property.description || 'No description available.'}</Text>
        {thumbnail ? <Text style={styles.imageUrl} numberOfLines={1}>{thumbnail}</Text> : null}
        <View style={styles.footer}>
          <Text style={styles.price}>{property.currency || 'ZMW'} {property.price || 'N/A'}</Text>
          <Text style={styles.type}>{property.type || 'Rental'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  image: {
    width: '100%',
    height: 180,
  },
  placeholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
  },
  info: {
    padding: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
  },
  description: {
    color: '#555',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E6F43',
  },
  type: {
    color: '#777',
  },
  imageUrl: {
    marginTop: 8,
    color: '#666',
    fontSize: 12,
  },
});
