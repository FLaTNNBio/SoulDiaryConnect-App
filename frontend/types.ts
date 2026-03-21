// types.ts
export type RootStackParamList = {
  Index: undefined;
  Login: undefined;
  Register: undefined;
  PatientTabs: undefined;
  DoctorTabs: undefined;
  NoteDetails: { noteId: number | string };
  NoteDetailsForm: { noteId: number | string };
  DoctorPatientDetailsTabs: { patientId: string; patientName: string };
};