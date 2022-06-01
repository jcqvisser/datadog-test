import { runMigrationsForTests } from './run-migrations-for-tests';

require('ts-node/register');

// add the following to the jest configuration:
// globalSetup: './src/test-helpers/database-setup.ts',

const setup = async (): Promise<void> => {
  await runMigrationsForTests();
};

export default setup;
