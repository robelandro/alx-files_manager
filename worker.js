import Bull from 'bull';
import { promises } from 'fs';
import generateThumbnail from 'image-thumbnail';
import { ObjectId } from 'mongodb';
import dbClient from './utils/db';

const fileQueue = new Bull('fileQueue');
const userQueue = new Bull('userQueue');

const { writeFile } = promises;

async function createAndSaveThumbnail(path, width) {
  const thumbnail = await generateThumbnail(
    path, { width, responseType: 'base64' },
  );
  const filePath = `${path}_${width}`;
  await writeFile(filePath, Buffer.from(thumbnail, 'base64'));
}

fileQueue.process(async (job, done) => {
  if (!job.data.fileId) {
    throw new Error('Missing fileId');
  }

  if (!job.data.userId) {
    throw new Error('Missing userId');
  }

  const dbs = dbClient.mongoClient.db(dbClient.database);
  const filedb = dbs.collection('files');

  const file = await filedb.findOne({
    _id: ObjectId(job.data.fileId),
    userId: ObjectId(job.data.userId),
  });

  if (!file) {
    throw new Error('File not found');
  }

  const THUMBNAIL_SIZES = [500, 250, 100];

  THUMBNAIL_SIZES.forEach(async (size) => {
    await createAndSaveThumbnail(file.localPath, size);
  });
  done();
});

userQueue.process(async (job, done) => {
  if (!job.data.userId) {
    throw new Error('Missing userId');
  }

  const dbs = dbClient.mongoClient.db(dbClient.database);
  const usersdb = dbs.collection('users');

  const user = await usersdb.findOne({
    _id: ObjectId(job.data.userId),
  });

  if (!user) {
    throw new Error('User not found');
  }

  console.log(`Welcome ${user.email}`);
  done();
});
