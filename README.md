import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

const PRESETS = {
  original: { brightness: 100, contrast: 100, saturation: 100, exposure: 100, vibrance: 100, blur: 0 },
  golden: { brightness: 112, contrast: 120, saturation: 128, exposure: 118, vibrance: 140, blur: 0 },
  vintage: { brightness: 116, contrast: 90, saturation: 82, exposure: 105, vibrance: 100, blur: 0.5 },
  cinematic: { brightness: 90, contrast: 138, saturation: 126, exposure: 112, vibrance: 120, blur: 0 },
  neon: { brightness: 108, contrast: 110, saturation: 150, exposure: 120, vibrance: 160, blur: 0 },
  mono: { brightness: 100, contrast: 120, saturation: 55, exposure: 100, vibrance: 90, blur: 0 },
};

const TOOL_TABS = ['adjust', 'filters', 'text', 'stickers'];
const STICKERS = ['✨', '⭐', '❤️', '🌈', '💎', '🎉', '🔥', '⚡', '🌟'];

export default function App() {
  const [selectedTab, setSelectedTab] = useState('adjust');
  const [imageUri, setImageUri] = useState(null);
  const [text, setText] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(32);
  const [opacity, setOpacity] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [exposure, setExposure] = useState(100);
  const [vibrance, setVibrance] = useState(100);
  const [blur, setBlur] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [sticker, setSticker] = useState('');

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const applyPreset = (name) => {
    const preset = PRESETS[name];
    if (!preset) return;
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    setSaturation(preset.saturation);
    setExposure(preset.exposure);
    setVibrance(preset.vibrance);
    setBlur(preset.blur);
  };

  const resetEditor = () => {
    setImageUri(null);
    setText('');
    setColor('#ffffff');
    setFontSize(32);
    setOpacity(100);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setExposure(100);
    setVibrance(100);
    setBlur(0);
    setRotation(0);
    setZoom(100);
    setSticker('');
  };

  const renderImage = () => {
    if (!imageUri) {
      return (
        <LinearGradient
          colors={['#1d2a3d', '#111827']}
          style={styles.placeholder}
        >
          <Text style={styles.placeholderText}>Upload a photo</Text>
          <Text style={styles.placeholderSubtext}>PixelCut Pro</Text>
        </LinearGradient>
      );
    }

    return (
      <View style={styles.imageFrame}>
        <Image
          source={{ uri: imageUri }}
          style={[
            styles.image,
            {
              opacity: 1,
              transform: [{ rotate: `${rotation}deg` }, { scale: zoom / 100 }],
              filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${imageUri ? 0 : 0}) blur(${blur}px)`,
            },
          ]}
        />

        {text ? (
          <Text
            style={[
              styles.textOverlay,
              {
                color,
                fontSize,
                opacity: opacity / 100,
              },
            ]}
          >
            {text}
          </Text>
        ) : null}

        {sticker ? (
          <Text style={styles.stickerOverlay}>{sticker}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.phoneFrame}>
        <View style={styles.notch} />

        <LinearGradient
          colors={['#101827', '#0b1020']}
          style={styles.appHeader}
        >
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><Text style={styles.brandText}>P</Text></View>
            <View>
              <Text style={styles.eyebrow}>PRO SUITE</Text>
              <Text style={styles.brandName}>PixelCut</Text>
            </View>
          </View>

          <Pressable style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.uploadIcon}>＋</Text>
            <Text style={styles.uploadText}>Upload Media</Text>
          </Pressable>
        </LinearGradient>

        <View style={styles.toolbarRow}>
          {TOOL_TABS.map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tabButton, selectedTab === tab && styles.tabButtonActive]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                {tab === 'adjust' ? 'Adjust' : tab === 'filters' ? 'Filters' : tab === 'text' ? 'Text' : 'Stickers'}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {selectedTab === 'adjust' && (
            <View style={styles.panel}>
              <SliderRow label="Brightness" value={brightness} max={200} suffix="%" onChange={setBrightness} />
              <SliderRow label="Contrast" value={contrast} max={200} suffix="%" onChange={setContrast} />
              <SliderRow label="Saturation" value={saturation} max={200} suffix="%" onChange={setSaturation} />
              <SliderRow label="Exposure" value={exposure} max={200} suffix="%" onChange={setExposure} />
              <SliderRow label="Vibrance" value={vibrance} max={200} suffix="%" onChange={setVibrance} />
              <SliderRow label="Blur" value={blur} max={12} suffix="px" onChange={setBlur} />
              <SliderRow label="Rotate" value={rotation} min={-180} max={180} suffix="°" onChange={setRotation} />
              <SliderRow label="Zoom" value={zoom} min={50} max={180} suffix="%" onChange={setZoom} />
            </View>
          )}

          {selectedTab === 'filters' && (
            <View style={styles.panel}>
              <View style={styles.presetGrid}>
                {Object.keys(PRESETS).map((name) => (
                  <Pressable
                    key={name}
                    style={[styles.preset, name === 'original' && styles.presetActive]}
                    onPress={() => applyPreset(name)}
                  >
                    <Text style={styles.presetText}>{name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {selectedTab === 'text' && (
            <View style={styles.panel}>
              <Text style={styles.label}>Text</Text>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Type something..."
                placeholderTextColor="#a7b3d1"
                style={styles.input}
              />

              <View style={styles.colorRow}>
                <Text style={styles.label}>Color</Text>
                <TextInput
                  value={color}
                  onChangeText={setColor}
                  style={styles.colorInput}
                />
              </View>

              <Text style={styles.label}>Font Size</Text>
              <Slider
                minimumValue={18}
                maximumValue={80}
                step={1}
                value={fontSize}
                onValueChange={setFontSize}
                minimumTrackTintColor="#8b5cf6"
                maximumTrackTintColor="#4b5563"
                thumbTintColor="#ffffff"
              />

              <Text style={styles.label}>Opacity</Text>
              <Slider
                minimumValue={10}
                maximumValue={100}
                step={1}
                value={opacity}
                onValueChange={setOpacity}
                minimumTrackTintColor="#8b5cf6"
                maximumTrackTintColor="#4b5563"
                thumbTintColor="#ffffff"
              />
            </View>
          )}

          {selectedTab === 'stickers' && (
            <View style={styles.panel}>
              <View style={styles.stickerGrid}>
                {STICKERS.map((item) => (
                  <Pressable key={item} style={styles.stickerItem} onPress={() => setSticker(item)}>
                    <Text style={styles.stickerText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.previewArea}>
          {renderImage()}
        </View>

        <View style={styles.footerBar}>
          <Pressable style={styles.secondaryButton} onPress={resetEditor}>
            <Text style={styles.secondaryText}>Reset</Text>
          </Pressable>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryText}>Export</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function SliderRow({ label, value, min = 0, max, suffix = '%', onChange }) {
  return (
    <View style={styles.sliderWrap}>
      <View style={styles.sliderHeader}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueText}>{value}{suffix}</Text>
      </View>

      <Slider
        minimumValue={min}
        maximumValue={max}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor="#8b5cf6"
        maximumTrackTintColor="#4b5563"
        thumbTintColor="#ffffff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070d18',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
  },
  phoneFrame: {
    width: '94%',
    maxWidth: 430,
    minHeight: 860,
    backgroundColor: '#0b1020',
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  notch: {
    width: 120,
    height: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: '#050b17',
    alignSelf: 'center',
  },
  appHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  eyebrow: {
    color: '#a7b3d1',
    fontSize: 10,
    letterSpacing: 1.4,
  },
  brandName: {
    color: '#edf2ff',
    fontSize: 24,
    fontWeight: '700',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  uploadIcon: {
    color: '#ffffff',
    fontSize: 22,
    marginRight: 6,
  },
  uploadText: {
    color: '#edf2ff',
    fontSize: 15,
    fontWeight: '700',
  },
  toolbarRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginTop: 6,
    marginBottom: 4,
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginHorizontal: 3,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.45)',
  },
  tabText: {
    color: '#a7b3d1',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#edf2ff',
  },
  content: {
    maxHeight: 300,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  panel: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 12,
  },
  sliderWrap: {
    marginBottom: 4,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    color: '#a7b3d1',
    fontSize: 12,
    fontWeight: '600',
  },
  valueText: {
    color: '#edf2ff',
    fontSize: 12,
    fontWeight: '700',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preset: {
    minWidth: '46%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  presetActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: 'rgba(139, 92, 246, 0.45)',
  },
  presetText: {
    color: '#edf2ff',
    fontSize: 12,
    textTransform: 'capitalize',
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#edf2ff',
    marginTop: 6,
    marginBottom: 12,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  colorInput: {
    width: 58,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    color: '#edf2ff',
    textAlign: 'center',
  },
  stickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stickerItem: {
    width: '31%',
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stickerText: {
    fontSize: 24,
  },
  previewArea: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 6,
  },
  placeholder: {
    height: 420,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  placeholderText: {
    color: '#edf2ff',
    fontSize: 24,
    fontWeight: '700',
  },
  placeholderSubtext: {
    color: '#a7b3d1',
    fontSize: 15,
    marginTop: 8,
  },
  imageFrame: {
    height: 420,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textOverlay: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 18,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 8,
  },
  stickerOverlay: {
    position: 'absolute',
    top: 20,
    right: 28,
    fontSize: 42,
    textShadowColor: 'rgba(0,0,0,0.42)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  footerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 18,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  secondaryText: {
    color: '#edf2ff',
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});
