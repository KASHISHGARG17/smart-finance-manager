import fs from 'fs/promises';
import path from 'path';

const getPath = (model) => path.join(process.cwd(), 'database', `${model}.json`);

export async function getCollection(model) {
  const file = getPath(model);
  try {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const defaultData = [];
      await saveCollection(model, defaultData);
      return defaultData;
    }
    throw error;
  }
}

export async function saveCollection(model, data) {
  const file = getPath(model);
  await fs.mkdir(path.dirname(file), { recursive: true }).catch(() => {});
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
}
