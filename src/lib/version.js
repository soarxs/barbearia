// Sistema de Versionamento BarberTime
// Formato: V MAJOR.MINOR.PATCH
// - MAJOR: Deploy (mudanças grandes)
// - MINOR: Deploy (mudanças médias) 
// - PATCH: Commit (mudanças pequenas)

export const VERSION = {
  major: 1,
  minor: 0,
  patch: 62, // Incrementado a cada commit
};

export const getVersionString = () => {
  return `V ${VERSION.major}.${VERSION.minor}.${VERSION.patch.toString().padStart(2, '0')}`;
};

export const incrementPatch = () => {
  VERSION.patch += 1;
  return getVersionString();
};

export const incrementMinor = () => {
  VERSION.minor += 1;
  VERSION.patch = 0;
  return getVersionString();
};

export const incrementMajor = () => {
  VERSION.major += 1;
  VERSION.minor = 0;
  VERSION.patch = 0;
  return getVersionString();
};
