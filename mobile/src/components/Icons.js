import React from 'react';
import { View, StyleSheet } from 'react-native';

// Simple line icon components - using basic shapes that work reliably
export const HomeIcon = ({ size = 24, color = '#000000' }) => {
  const stroke = 2;
  const half = size / 2;
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Simple house shape */}
      <View style={[
        styles.rect,
        {
          width: size * 0.6,
          height: size * 0.5,
          borderWidth: stroke,
          borderColor: color,
          backgroundColor: 'transparent',
          top: size * 0.25,
          left: size * 0.2,
        }
      ]} />
      {/* Roof */}
      <View style={[
        styles.triangle,
        {
          borderBottomWidth: size * 0.3,
          borderLeftWidth: size * 0.3,
          borderRightWidth: size * 0.3,
          borderBottomColor: color,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          top: size * 0.05,
          left: size * 0.2,
        }
      ]} />
    </View>
  );
};

export const ActivityIcon = ({ size = 24, color = '#000000' }) => {
  const stroke = 2;
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[
        styles.line,
        {
          width: size * 0.5,
          height: stroke,
          backgroundColor: color,
          top: size * 0.3,
          left: size * 0.25,
        }
      ]} />
      <View style={[
        styles.line,
        {
          width: size * 0.6,
          height: stroke,
          backgroundColor: color,
          top: size * 0.5,
          left: size * 0.2,
        }
      ]} />
      <View style={[
        styles.line,
        {
          width: size * 0.5,
          height: stroke,
          backgroundColor: color,
          top: size * 0.7,
          left: size * 0.25,
        }
      ]} />
    </View>
  );
};

export const ChatIcon = ({ size = 24, color = '#000000' }) => {
  const stroke = 2;
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[
        styles.rect,
        {
          width: size * 0.7,
          height: size * 0.55,
          borderWidth: stroke,
          borderColor: color,
          backgroundColor: 'transparent',
          borderRadius: size * 0.15,
          top: size * 0.1,
          left: size * 0.15,
        }
      ]} />
      <View style={[
        styles.circle,
        {
          width: size * 0.08,
          height: size * 0.08,
          backgroundColor: color,
          top: size * 0.3,
          left: size * 0.35,
        }
      ]} />
      <View style={[
        styles.circle,
        {
          width: size * 0.08,
          height: size * 0.08,
          backgroundColor: color,
          top: size * 0.45,
          left: size * 0.35,
        }
      ]} />
    </View>
  );
};

export const SettingsIcon = ({ size = 24, color = '#000000' }) => {
  const stroke = 2;
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[
        styles.circle,
        {
          width: size * 0.6,
          height: size * 0.6,
          borderWidth: stroke,
          borderColor: color,
          backgroundColor: 'transparent',
          top: size * 0.2,
          left: size * 0.2,
        }
      ]} />
      <View style={[
        styles.circle,
        {
          width: size * 0.25,
          height: size * 0.25,
          borderWidth: stroke,
          borderColor: color,
          backgroundColor: 'transparent',
          top: size * 0.375,
          left: size * 0.375,
        }
      ]} />
      <View style={[
        styles.rect,
        {
          width: stroke,
          height: size * 0.2,
          backgroundColor: color,
          top: size * 0.05,
          left: size * 0.49,
        }
      ]} />
      <View style={[
        styles.rect,
        {
          width: stroke,
          height: size * 0.2,
          backgroundColor: color,
          bottom: size * 0.05,
          left: size * 0.49,
        }
      ]} />
      <View style={[
        styles.rect,
        {
          width: size * 0.2,
          height: stroke,
          backgroundColor: color,
          top: size * 0.49,
          left: size * 0.05,
        }
      ]} />
      <View style={[
        styles.rect,
        {
          width: size * 0.2,
          height: stroke,
          backgroundColor: color,
          top: size * 0.49,
          right: size * 0.05,
        }
      ]} />
    </View>
  );
};

export const NotificationIcon = ({ size = 24, color = '#000000' }) => {
  const stroke = 2;
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[
        styles.rect,
        {
          width: size * 0.4,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          top: size * 0.15,
          left: size * 0.3,
        }
      ]} />
      <View style={[
        styles.rect,
        {
          width: size * 0.6,
          height: size * 0.55,
          borderWidth: stroke,
          borderColor: color,
          backgroundColor: 'transparent',
          borderRadius: size * 0.3,
          top: size * 0.2,
          left: size * 0.2,
        }
      ]} />
      <View style={[
        styles.circle,
        {
          width: size * 0.1,
          height: size * 0.1,
          backgroundColor: color,
          top: size * 0.6,
          left: size * 0.45,
        }
      ]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  line: {
    position: 'absolute',
  },
  rect: {
    position: 'absolute',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
  },
  triangle: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
  },
});
