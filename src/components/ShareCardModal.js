// src/components/ShareCardModal.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePremium } from "../theme/PremiumContext";
import { useTheme } from '../theme/ThemeContext';
import { FontSizes } from '../theme/colors';

const { width: SW } = Dimensions.get('window');
const CW = SW - 60;
const CH = CW * 1.25;

// Load html2canvas dynamically for web
let html2canvasLoaded = false;
function loadHtml2Canvas() {
  if (Platform.OS !== 'web' || html2canvasLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    if (window.html2canvas) { html2canvasLoaded = true; resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = () => { html2canvasLoaded = true; resolve(); };
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

// ========== TEMPLATES ==========
function TemplateSaffron({ verse }) {
  return (
    <LinearGradient colors={['#FDF8EF', '#F5E0BE', '#EDD0A0']} style={{ width: CW, height: CH, borderRadius: 20, padding: 28 }}>
      <View style={{ position: 'absolute', top: 12, left: 12, width: 24, height: 24, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#C28840', borderTopLeftRadius: 6, opacity: 0.35 }} />
      <View style={{ position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#C28840', borderTopRightRadius: 6, opacity: 0.35 }} />
      <View style={{ position: 'absolute', bottom: 12, left: 12, width: 24, height: 24, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#C28840', borderBottomLeftRadius: 6, opacity: 0.35 }} />
      <View style={{ position: 'absolute', bottom: 12, right: 12, width: 24, height: 24, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#C28840', borderBottomRightRadius: 6, opacity: 0.35 }} />
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 30, height: 1, backgroundColor: '#C28840', opacity: 0.4 }} />
          <Text style={{ fontSize: 28, color: '#C28840' }}>{'\u0950'}</Text>
          <View style={{ width: 30, height: 1, backgroundColor: '#C28840', opacity: 0.4 }} />
        </View>
        <View style={{ backgroundColor: 'rgba(194,136,64,0.12)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 999, marginTop: 8 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#9E6B2C', letterSpacing: 1 }}>BHAGAVAD GITA {verse.chapter}.{verse.verse}</Text>
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, color: '#5C3018', lineHeight: 30, textAlign: 'center', marginBottom: 16 }}>{verse.sanskrit}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingHorizontal: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#C28840', opacity: 0.25 }} />
          <View style={{ width: 6, height: 6, backgroundColor: '#C28840', opacity: 0.4, transform: [{ rotate: '45deg' }] }} />
          <View style={{ flex: 1, height: 1, backgroundColor: '#C28840', opacity: 0.25 }} />
        </View>
        <Text style={{ fontSize: 14, color: '#6B4F27', lineHeight: 22, textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 8 }}>"{verse.english}"</Text>
      </View>
      <View style={{ alignItems: 'center', marginTop: 12 }}><Text style={{ fontSize: 11, fontWeight: '700', color: '#C28840', letterSpacing: 2 }}>GITASAAR</Text></View>
    </LinearGradient>
  );
}

function TemplateRoyal({ verse }) {
  return (
    <LinearGradient colors={['#1A1209', '#2A1F12', '#1A1209']} style={{ width: CW, height: CH, borderRadius: 20, padding: 28 }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(219,160,78,0.25)' }} />
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 30, color: '#DBA04E' }}>{'\u0950'}</Text>
        <View style={{ backgroundColor: 'rgba(219,160,78,0.12)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 999, marginTop: 8 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#DBA04E', letterSpacing: 1 }}>BHAGAVAD GITA {verse.chapter}.{verse.verse}</Text>
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, color: '#E8B465', lineHeight: 30, textAlign: 'center', marginBottom: 16 }}>{verse.sanskrit}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingHorizontal: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#DBA04E', opacity: 0.2 }} />
          <View style={{ width: 6, height: 6, backgroundColor: '#DBA04E', opacity: 0.35, transform: [{ rotate: '45deg' }] }} />
          <View style={{ flex: 1, height: 1, backgroundColor: '#DBA04E', opacity: 0.2 }} />
        </View>
        <Text style={{ fontSize: 14, color: '#C8B696', lineHeight: 22, textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 8 }}>"{verse.english}"</Text>
      </View>
      <View style={{ alignItems: 'center', marginTop: 12 }}><Text style={{ fontSize: 11, fontWeight: '700', color: '#DBA04E', letterSpacing: 2 }}>GITASAAR</Text></View>
    </LinearGradient>
  );
}

function TemplateCosmos({ verse }) {
  return (
    <LinearGradient colors={['#000005', '#0C0A3E', '#1E1B4B']} style={{ width: CW, height: CH, borderRadius: 20, padding: 28 }}>
      {/* Star dots */}
      {[[10,20],[50,8],[80,15],[20,45],[70,35],[90,50],[15,70],[55,65],[85,80],[30,90]].map(([l,t], i) => (
        <View key={i} style={{ position: 'absolute', left: `${l}%`, top: `${t}%`, width: i%3===0?3:2, height: i%3===0?3:2, borderRadius: 2, backgroundColor: '#FFFFFF', opacity: 0.4 + (i*0.04) }} />
      ))}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(224,168,80,0.20)' }} />
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 28, color: '#E0A850' }}>{'\u0950'}</Text>
        <View style={{ backgroundColor: 'rgba(224,168,80,0.12)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 999, marginTop: 8 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#E0A850', letterSpacing: 1 }}>BHAGAVAD GITA {verse.chapter}.{verse.verse}</Text>
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, color: '#FCD34D', lineHeight: 30, textAlign: 'center', marginBottom: 16 }}>{verse.sanskrit}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingHorizontal: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#8B5CF6', opacity: 0.35 }} />
          <View style={{ width: 6, height: 6, backgroundColor: '#8B5CF6', opacity: 0.6, borderRadius: 3 }} />
          <View style={{ flex: 1, height: 1, backgroundColor: '#8B5CF6', opacity: 0.35 }} />
        </View>
        <Text style={{ fontSize: 14, color: 'rgba(240,240,255,0.80)', lineHeight: 22, textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 8 }}>"{verse.english}"</Text>
      </View>
      <View style={{ alignItems: 'center', marginTop: 12 }}><Text style={{ fontSize: 11, fontWeight: '700', color: '#8B5CF6', letterSpacing: 2 }}>GITASAAR</Text></View>
    </LinearGradient>
  );
}

function TemplatePeacock({ verse }) {
  return (
    <LinearGradient colors={['#0A4F4F', '#0E6B6B', '#0A4F4F']} style={{ width: CW, height: CH, borderRadius: 20, padding: 28 }}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 28, color: '#E8B465' }}>{'\u0950'}</Text>
        <View style={{ backgroundColor: 'rgba(232,180,101,0.12)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 999, marginTop: 8 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#E8B465', letterSpacing: 1 }}>BHAGAVAD GITA {verse.chapter}.{verse.verse}</Text>
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, color: '#FFFFFF', lineHeight: 30, textAlign: 'center', marginBottom: 16 }}>{verse.sanskrit}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingHorizontal: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#E8B465', opacity: 0.2 }} />
          <View style={{ width: 6, height: 6, backgroundColor: '#E8B465', opacity: 0.35, transform: [{ rotate: '45deg' }] }} />
          <View style={{ flex: 1, height: 1, backgroundColor: '#E8B465', opacity: 0.2 }} />
        </View>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 22, textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 8 }}>"{verse.english}"</Text>
      </View>
      <View style={{ alignItems: 'center', marginTop: 12 }}><Text style={{ fontSize: 11, fontWeight: '700', color: '#E8B465', letterSpacing: 2 }}>GITASAAR</Text></View>
    </LinearGradient>
  );
}

function TemplateSunset({ verse }) {
  return (
    <LinearGradient colors={['#2D1B4E', '#7B2D5F', '#D4573B', '#F2A93B']} locations={[0, 0.35, 0.7, 1]} style={{ width: CW, height: CH, borderRadius: 20, padding: 28 }}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 32, color: 'rgba(255,255,255,0.9)' }}>{'\u0950'}</Text>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 999, marginTop: 8 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFF', letterSpacing: 1 }}>BHAGAVAD GITA {verse.chapter}.{verse.verse}</Text>
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, color: '#FFFFFF', lineHeight: 30, textAlign: 'center', marginBottom: 16 }}>{verse.sanskrit}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' }} />
          <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
        </View>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 22, textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 8 }}>"{verse.english}"</Text>
      </View>
      <View style={{ alignItems: 'center', marginTop: 12 }}><Text style={{ fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 2 }}>GITASAAR</Text></View>
    </LinearGradient>
  );
}

function TemplateLotus({ verse }) {
  return (
    <LinearGradient colors={['#1A0A1E', '#2D1233', '#1A0A1E']} style={{ width: CW, height: CH, borderRadius: 20, padding: 28 }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(201,90,106,0.2)' }} />
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 28, color: '#C95A6A' }}>{'\u0950'}</Text>
        <View style={{ backgroundColor: 'rgba(201,90,106,0.15)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 999, marginTop: 8 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#E8889A', letterSpacing: 1 }}>BHAGAVAD GITA {verse.chapter}.{verse.verse}</Text>
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, color: '#F0D0D8', lineHeight: 30, textAlign: 'center', marginBottom: 16 }}>{verse.sanskrit}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#C95A6A', opacity: 0.2 }} />
          <View style={{ width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: '#C95A6A', opacity: 0.4 }} />
          <View style={{ flex: 1, height: 1, backgroundColor: '#C95A6A', opacity: 0.2 }} />
        </View>
        <Text style={{ fontSize: 14, color: 'rgba(240,208,216,0.8)', lineHeight: 22, textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 8 }}>"{verse.english}"</Text>
      </View>
      <View style={{ alignItems: 'center', marginTop: 12 }}><Text style={{ fontSize: 11, fontWeight: '700', color: '#C95A6A', letterSpacing: 2 }}>GITASAAR</Text></View>
    </LinearGradient>
  );
}

const TEMPLATES = [
  { id: 'cosmos', label: 'Cosmos', icon: 'star-four-points', color: '#8B5CF6', Component: TemplateCosmos },
  { id: 'royal', label: 'Royal', icon: 'crown-outline', color: '#DBA04E', Component: TemplateRoyal },
  { id: 'saffron', label: 'Saffron', icon: 'white-balance-sunny', color: '#C28840', Component: TemplateSaffron },
  { id: 'peacock', label: 'Peacock', icon: 'feather', color: '#14918E', Component: TemplatePeacock },
  { id: 'sunset', label: 'Sunset', icon: 'weather-sunset', color: '#D4573B', Component: TemplateSunset },
  { id: 'lotus', label: 'Lotus', icon: 'flower-tulip-outline', color: '#C95A6A', Component: TemplateLotus },
];

export default function ShareCardModal({ visible, verse, onClose }) {
  const { colors: C } = useTheme();
  const { isTemplateAvailable, isPremium } = usePremium();
  const [activeTemplate, setActiveTemplate] = useState('cosmos');
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const cardRef = useRef(null);

  // Load html2canvas when modal opens
  useEffect(() => {
    if (visible && Platform.OS === 'web') loadHtml2Canvas();
  }, [visible]);

  if (!verse) return null;
  const Active = TEMPLATES.find(t => t.id === activeTemplate)?.Component || TemplateSaffron;

  const handleDownload = async () => {
    setDownloading(true);
    setDownloaded(false);

    try {
      if (Platform.OS === 'web' && window.html2canvas && cardRef.current) {
        // Find the actual DOM node
        const node = cardRef.current;
        // html2canvas needs the actual DOM element
        // In React Native Web, the ref gives us a View which has a DOM node
        const domNode = node._nativeTag || node;

        const canvas = await window.html2canvas(domNode, {
          backgroundColor: null,
          scale: 2, // High quality
          useCORS: true,
          logging: false,
        });

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `GitaSaar_${verse.chapter}_${verse.verse}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setDownloaded(true);
            setTimeout(() => setDownloaded(false), 3000);
          }
        }, 'image/png');
      }
    } catch (e) {
      console.log('Download error:', e);
    }

    setDownloading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: C.bgOverlay, justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: C.bgPrimary, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginTop: 12 }} />

          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 }}>
            <View>
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary }}>Share Card</Text>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>Choose style & download</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="close" size={18} color={C.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 30 }}>
            {/* Card Preview */}
            <View ref={cardRef} collapsable={false} style={{ marginBottom: 16 }}>
              <Active verse={verse} />
            </View>

            {/* Download Button */}
            <TouchableOpacity onPress={handleDownload} disabled={downloading} activeOpacity={0.85} style={{ marginBottom: 16 }}>
              <LinearGradient colors={downloaded ? ['#2E7D50', '#1B5E38'] : C.gradientGold}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 999 }}>
                <MaterialCommunityIcons name={downloaded ? 'check-circle' : downloading ? 'loading' : 'download'} size={18} color={downloaded ? '#FFF' : C.textOnPrimary} />
                <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: downloaded ? '#FFF' : C.textOnPrimary }}>
                  {downloaded ? 'Downloaded!' : downloading ? 'Saving...' : 'Download Card'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Template Selector */}
            <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1.5, marginBottom: 10 }}>CHOOSE STYLE</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', paddingHorizontal: 20, marginBottom: 16 }}>
              {TEMPLATES.map((t) => (
                <TouchableOpacity key={t.id}
                  style={{ width: 72, alignItems: 'center', gap: 5, paddingVertical: 8, backgroundColor: activeTemplate === t.id ? C.primarySoft : C.bgCard, borderRadius: 12, borderWidth: 1.5, borderColor: activeTemplate === t.id ? C.primary : C.border }}
                  onPress={() => { if (isTemplateAvailable(t.id)) setActiveTemplate(t.id); else navigation.navigate("Premium"); }} activeOpacity={0.7}>
                  <MaterialCommunityIcons name={t.icon} size={18} color={activeTemplate === t.id ? t.color : C.textMuted} />
                  {!isTemplateAvailable(t.id) && <View style={{ position: "absolute", top: 2, right: 2 }}><MaterialCommunityIcons name="lock" size={10} color={C.primary} /></View>}
                  <Text style={{ fontSize: 10, fontWeight: '600', color: activeTemplate === t.id ? C.primary : C.textMuted }}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}