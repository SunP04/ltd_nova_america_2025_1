import AppDataSource from './data-source';

async function run() {
  await AppDataSource.initialize();
  try {
    await AppDataSource.runMigrations();
  } finally {
    await AppDataSource.destroy();
  }
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to run migrations', error);
  process.exit(1);
});
