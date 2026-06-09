export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { loadVaultKeys } = await import('./lib/keystore');
    await loadVaultKeys();
  }
}
