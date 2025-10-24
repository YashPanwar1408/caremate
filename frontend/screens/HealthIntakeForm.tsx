import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TextInput, Button, Text, RadioButton, Chip, HelperText } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { api } from '../api/client';
import { submitHealthForm } from '../api/ml';

const ACCENT = '#0ea5e9';

const symptomOptions = [
  'Headache',
  'Fever',
  'Cough',
  'Shortness of breath',
  'Chest pain',
  'Nausea',
  'Fatigue',
];

const Schema = Yup.object({
  age: Yup.number().typeError('Age must be a number').min(0).max(120).required('Age is required'),
  sex: Yup.string().oneOf(['male', 'female', 'other']).required('Sex is required'),
  height: Yup.number().typeError('Height must be a number').min(30).max(250).required('Height is required'),
  weight: Yup.number().typeError('Weight must be a number').min(2).max(500).required('Weight is required'),
  systolic: Yup.number().typeError('Systolic must be a number').min(60).max(250).required('Systolic is required'),
  diastolic: Yup.number().typeError('Diastolic must be a number').min(30).max(150).required('Diastolic is required'),
  glucose: Yup.number().typeError('Glucose must be a number').min(20).max(600).required('Glucose is required'),
  symptoms: Yup.array().of(Yup.string()).min(0),
  pastDiseases: Yup.string().max(2000),
  medications: Yup.string().max(2000),
});

type RouteParams = { disease?: 'Diabetes' | 'Heart' | 'Kidney' };

export default function HealthIntakeForm(props: any) {
  const navigation = useNavigation<any>();
  const disease = (props?.route?.params as RouteParams)?.disease;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{disease ? `${disease} Risk Intake` : 'Health Intake'}</Text>
      <Formik
        initialValues={{
          age: '',
          sex: 'other',
          height: '',
          weight: '',
          systolic: '',
          diastolic: '',
          glucose: '',
          symptoms: [] as string[],
          pastDiseases: '',
          medications: '',
          labsUploaded: false,
          wearableImported: false,
        }}
        validationSchema={Schema}
        onSubmit={async (values, { setSubmitting, resetForm, setStatus }) => {
          try {
            const payload = {
              ...values,
              bp: `${values.systolic}/${values.diastolic}`,
            };
            await api.post('/intake', payload).catch(() => Promise.resolve()); // mock backend intake save
            // Get prediction results from ML API helper (handles fallback/mocks)
            const prediction = await submitHealthForm({ ...payload, disease });
            const overallBand = prediction.overallBand || (prediction.diseases.find(d => d.band === 'high') ? 'high' : (prediction.diseases.find(d => d.band === 'medium') ? 'medium' : 'low'));

            setStatus({ ok: true });
            resetForm({ values: { ...values, labsUploaded: false, wearableImported: false } });
            navigation.navigate('MLPrediction' as never, {
              riskBand: overallBand,
              diseases: prediction.diseases.map(d => ({ name: d.name, probability: d.probability })),
              shapTop: prediction.shapTop || [],
              recommendations: prediction.recommendations,
              reportId: prediction.reportId,
            } as never);
          } catch (e) {
            setStatus({ ok: false, message: 'Failed to submit. Please try again.' });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, setFieldValue, status }) => (
          <View>
            {/* Age */}
            <TextInput
              mode="outlined"
              label="Age"
              keyboardType="numeric"
              value={String(values.age)}
              onChangeText={handleChange('age')}
              onBlur={handleBlur('age')}
              style={styles.input}
            />
            <HelperText type="error" visible={!!(touched.age && errors.age)}>
              {touched.age && errors.age}
            </HelperText>

            {/* Sex */}
            <Text style={styles.sectionLabel}>Sex</Text>
            <RadioButton.Group value={values.sex} onValueChange={(v) => setFieldValue('sex', v)}>
              <View style={styles.row}>
                <View style={styles.radioItem}>
                  <RadioButton value="male" />
                  <Text>Male</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="female" />
                  <Text>Female</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="other" />
                  <Text>Other</Text>
                </View>
              </View>
            </RadioButton.Group>
            <HelperText type="error" visible={!!(touched.sex && errors.sex)}>
              {touched.sex && (errors.sex as string)}
            </HelperText>

            {/* Height / Weight */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <TextInput
                  mode="outlined"
                  label="Height (cm)"
                  keyboardType="numeric"
                  value={String(values.height)}
                  onChangeText={handleChange('height')}
                  onBlur={handleBlur('height')}
                  style={styles.input}
                />
                <HelperText type="error" visible={!!(touched.height && errors.height)}>
                  {touched.height && (errors.height as string)}
                </HelperText>
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <TextInput
                  mode="outlined"
                  label="Weight (kg)"
                  keyboardType="numeric"
                  value={String(values.weight)}
                  onChangeText={handleChange('weight')}
                  onBlur={handleBlur('weight')}
                  style={styles.input}
                />
                <HelperText type="error" visible={!!(touched.weight && errors.weight)}>
                  {touched.weight && (errors.weight as string)}
                </HelperText>
              </View>
            </View>

            {/* Blood Pressure */}
            <Text style={styles.sectionLabel}>Blood Pressure (mmHg)</Text>
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <TextInput
                  mode="outlined"
                  label="Systolic"
                  keyboardType="numeric"
                  value={String(values.systolic)}
                  onChangeText={handleChange('systolic')}
                  onBlur={handleBlur('systolic')}
                  style={styles.input}
                />
                <HelperText type="error" visible={!!(touched.systolic && errors.systolic)}>
                  {touched.systolic && (errors.systolic as string)}
                </HelperText>
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <TextInput
                  mode="outlined"
                  label="Diastolic"
                  keyboardType="numeric"
                  value={String(values.diastolic)}
                  onChangeText={handleChange('diastolic')}
                  onBlur={handleBlur('diastolic')}
                  style={styles.input}
                />
                <HelperText type="error" visible={!!(touched.diastolic && errors.diastolic)}>
                  {touched.diastolic && (errors.diastolic as string)}
                </HelperText>
              </View>
            </View>

            {/* Glucose */}
            <TextInput
              mode="outlined"
              label="Glucose (mg/dL)"
              keyboardType="numeric"
              value={String(values.glucose)}
              onChangeText={handleChange('glucose')}
              onBlur={handleBlur('glucose')}
              style={styles.input}
            />
            <HelperText type="error" visible={!!(touched.glucose && errors.glucose)}>
              {touched.glucose && (errors.glucose as string)}
            </HelperText>

            {/* Symptoms picker (multi) */}
            <Text style={styles.sectionLabel}>Symptoms</Text>
            <View style={styles.chipsRow}>
              {symptomOptions.map((s) => {
                const selected = values.symptoms.includes(s);
                return (
                  <Chip
                    key={s}
                    selected={selected}
                    onPress={() => {
                      const arr = selected
                        ? values.symptoms.filter((x) => x !== s)
                        : [...values.symptoms, s];
                      setFieldValue('symptoms', arr);
                    }}
                    style={{ marginRight: 6, marginBottom: 6 }}
                  >
                    {s}
                  </Chip>
                );
              })}
            </View>

            {/* Past diseases / Medications */}
            <TextInput
              mode="outlined"
              label="Past diseases"
              value={values.pastDiseases}
              onChangeText={handleChange('pastDiseases')}
              onBlur={handleBlur('pastDiseases')}
              style={styles.input}
              multiline
            />
            <HelperText type="error" visible={!!(touched.pastDiseases && errors.pastDiseases)}>
              {touched.pastDiseases && (errors.pastDiseases as string)}
            </HelperText>
            <TextInput
              mode="outlined"
              label="Medications"
              value={values.medications}
              onChangeText={handleChange('medications')}
              onBlur={handleBlur('medications')}
              style={styles.input}
              multiline
            />
            <HelperText type="error" visible={!!(touched.medications && errors.medications)}>
              {touched.medications && (errors.medications as string)}
            </HelperText>

            {/* Mock actions */}
            <View style={styles.row}>
              <Button
                mode="outlined"
                onPress={() => setFieldValue('labsUploaded', true)}
                style={{ flex: 1, marginRight: 6 }}
              >
                Upload lab values
              </Button>
              <Button
                mode="outlined"
                onPress={() => {
                  setFieldValue('wearableImported', true);
                  // optional: light prefill mimic
                  if (!values.systolic && !values.diastolic) {
                    setFieldValue('systolic', '120');
                    setFieldValue('diastolic', '78');
                  }
                }}
                style={{ flex: 1, marginLeft: 6 }}
              >
                Import from wearable
              </Button>
            </View>
            {(values.labsUploaded || values.wearableImported) && (
              <Text style={styles.hint}>
                {values.labsUploaded ? 'Lab data marked as uploaded. ' : ''}
                {values.wearableImported ? 'Wearable data imported.' : ''}
              </Text>
            )}

            {/* Submit */}
            <Button
              mode="contained"
              onPress={() => handleSubmit()}
              loading={isSubmitting}
              buttonColor={ACCENT}
              style={{ marginTop: 8 }}
            >
              Submit
            </Button>
            {status?.ok && <Text style={styles.saved}>Submitted.</Text>}
            {status?.ok === false && <Text style={styles.error}>{status.message}</Text>}
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 16, color: ACCENT },
  input: { marginBottom: 4 },
  saved: { marginTop: 12, color: '#15803d' },
  error: { marginTop: 12, color: '#b91c1c' },
  sectionLabel: { marginTop: 8, marginBottom: 4, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  radioItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  hint: { marginTop: 8, color: '#475569' },
});
