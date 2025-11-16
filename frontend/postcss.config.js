export default async () => {
  let autoprefixerPlugin;
  try {
    const module = await import('autoprefixer');
    autoprefixerPlugin = module.default;
  } catch (error) {
    console.warn('Autoprefixer not found, proceeding without it');
  }

  return {
    plugins: {
      tailwindcss: {},
      ...(autoprefixerPlugin ? { autoprefixer: autoprefixerPlugin } : {}),
    },
  };
};
