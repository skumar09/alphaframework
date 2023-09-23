// import and alias fs.promises
import inquirer from 'inquirer';
import { promises as fsPromises } from 'fs';
import path from 'path';

const { copyFile, mkdir, readdir } = fsPromises;

const filesToCopy = [
  {
    source: new URL('.github/workflows/dailyrun.yml', import.meta.url),
    target: path.join(process.cwd(), '.github', 'workflows', 'dailyrun.yml'),
  },
  {
    source: new URL('.github/workflows/selfrun.yml', import.meta.url),
    target: path.join(process.cwd(), '.github', 'workflows', 'selfrun.yml'),
  },
  {
    source: new URL('selectors/example.block.js', import.meta.url),
    target: path.join(process.cwd(), 'selectors', 'example.block.js'),
  },
  {
    source: new URL('features/example.spec.js', import.meta.url),
    target: path.join(process.cwd(), 'features', 'example.spec.js'),
  },
  {
    source: new URL('tests/example.test.js', import.meta.url),
    target: path.join(process.cwd(), 'tests', 'example.test.js'),
  },
  {
    source: new URL('global.setup.js', import.meta.url),
    target: path.join(process.cwd(), 'global.setup.js'),
  },
  {
    source: new URL('playwright.config.js', import.meta.url),
    target: path.join(process.cwd(), 'playwright.config.js'),
  },
];

async function copyFileIfExists(source, target) {
  try {
    await copyFile(source, target);
    console.log(`Copied ${source} to ${target}`);
  } catch (error) {
    console.error(`Error copying ${source} to ${target}: ${error.message}`);
  }
}

// Prompt the user about GitHub Actions and necessary folders
inquirer
  .prompt([
    {
      type: 'confirm',
      name: 'includeGitHubActions',
      message: 'Do you want to include GitHub Actions files?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'createFolders',
      message: 'Do you want to create the necessary folders (selectors, features, tests)?',
      default: true,
    },
  ])
  .then(async (answers) => {
    if (answers.includeGitHubActions) {
      // Copy GitHub Action files to the project directory
      for (const { source, target } of filesToCopy.slice(0, 2)) {
        if (!(await fileExists(target))) {
          await copyFileIfExists(source, target);
        } else {
          console.log(`Skipped copying ${source} to ${target} (already exists).`);
        }
      }
    } else {
      console.log('GitHub Action files were not added to your project.');
    }

    if (answers.createFolders) {
      // Create the necessary folders
      for (const { source, target } of filesToCopy.slice(2)) {
        const folderPath = path.dirname(target);

        if (!(await folderExists(folderPath))) {
          await mkdir(folderPath, { recursive: true });
        }

        if (!(await fileExists(target))) {
          await copyFileIfExists(source, target);
        } else {
          console.log(`Skipped copying ${source} to ${target} (already exists).`);
        }
      }

      // Copy global.setup.js and playwright.config.js to the root folder
      for (const { source, target } of filesToCopy.slice(5, 7)) {
        if (!(await fileExists(target))) {
          await copyFileIfExists(source, target);
        } else {
          console.log(`Skipped copying ${source} to ${target} (already exists).`);
        }
      }

      console.log('Necessary folders and files have been added to your project.');
    } else {
      console.log('Necessary folders and files were not added to your project.');
    }

    // Continue with the rest of your installation logic...
  });

async function fileExists(filePath) {
  try {
    await fsPromises.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

async function folderExists(folderPath) {
  try {
    const items = await readdir(folderPath);
    return items && items.length > 0;
  } catch (error) {
    return false;
  }
}
