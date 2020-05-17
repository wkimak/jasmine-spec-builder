function getStubFileName(provider: string): string {
  return provider + 'Stub.ts';
}

function getStubName(provider: string): string {
  return provider + 'Stub';
}

function removePathExtension(path: string): string {
  return path.slice(0, -3);
}

export { getStubFileName, getStubName, removePathExtension };