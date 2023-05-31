import { ObjectId } from 'mongodb';
import mime from 'mime-types';
import Queue from 'bull';

import dbClient from '../utils/db';
import userUtils from '../utils/user';

const fileQueue = new Queue('fileQueue');

class FilesController {
  /**
   * Creates a new file in DB and in disk
   *
   * To create a file, you must specify the following information:
   * - name (string)
   * - type (string)
   * - parentId (string)
   * - isPublic (boolean, optional)
   * If parentId is not specified, the file will be created at the root of the user.
   * If isPublic is not specified, it will be set to false by default.
   * If the user does not exist, return an error "Unauthorized" with status code 401.
   * If name is not specified, return an error "Missing name" with status code 400.
   * If type is not specified, return an error "Missing type" with status code 400.
   * If type is not supported, return an error "Unsupported media type" with status code 415.
   * Otherwise:
   * - Create a new file in DB with the following information:
   *   - userId (ObjectId)
   *   - name (string)
   *   - type (string)
   *   - isPublic (boolean)
   *   - parentId (ObjectId)
   *   - path (string)
   * - Create a new file in disk with the following information:
   *   - If parentId is specified, the file will be created in the folder associated with the parentId.
   *   - Otherwise, the file will be created at the root of the user.
   *   - The name of the file will be the ObjectId of the file.
   * - Return the new file with status code 201.
   */
  static async postUpload(request, response) {
    const { userId } = await userUtils.getUserIdAndKey(request);

    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const { name, type, parentId } = request.body;

    if (!name) {
      return response.status(400).json({ error: 'Missing name' });
    }

    if (!type) {
      return response.status(400).json({ error: 'Missing type' });
    }

    const supportedTypes = ['folder', 'file', 'image'];
    if (!supportedTypes.includes(type)) {
      return response.status(415).json({ error: 'Unsupported media type' });
    }

    const parent = parentId ? await dbClient.filesCollection.findOne
      ({ _id: ObjectId(parentId), userId }) : null;

    if (parentId && !parent) {
      return response.status(400).json({ error: 'Parent not found' });
    }

    const isPublic = request.body.isPublic || false;

    const file = {
      userId,
      name,
      type,
      isPublic,
      parentId: parentId || 0,
    };

    const result = await dbClient.filesCollection.insertOne(file);

    const path = `${process.env.FOLDER_PATH || '/tmp/files'}/${result.insertedId}`;

    if (type !== 'folder') {


      await fileQueue.add({
        userId,
        fileId: result.insertedId.toString(),
      });
    }

    return response.status(201).json({
      id: result.insertedId,
      userId,
      name,
      type,
      isPublic,
      parentId: parentId || 0,
      path,
    });
  }

  /**
   * Returns the status of a file
   * 
   * If the user does not exist, return an error "Unauthorized" with status code 401.
   * 
   * If the file does not exist, return an error "Not found" with status code 404.
   * 
   * Otherwise, return the status of the file with status code 200.
   * 
   * The status is an object with the following information:
   * 
   * - id (string)
   * - userId (string)
   * - name (string)
   * - type (string)
   *  