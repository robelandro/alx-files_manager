import { ObjectId } from 'mongodb';
import { v4 as uuidV4 } from 'uuid';
import fs from 'fs';
import Queue from 'bull';
import dbClient from './db';

const fileQueue = new Queue('fileQueue');

const MAX_PAGE_SIZE = 20;

/**
 * Class Files
 */
class Files {
  constructor(name, type, data, parentId = 0, isPublic = false) {
    this.dbs = dbClient.mongoClient.db(dbClient.database);
    this.filedb = this.dbs.collection('files');
    this.name = name;
    this.type = type;
    this.data = data;
    this.parentId = parentId;
    this.isPublic = isPublic;
    this.FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
  }

  /**
   * The function checks if the type is valid.
   */
  isValidType() {
    const types = ['folder', 'file', 'image'];
    return types.includes(this.type);
  }

  /**
   * The function checks if the data is valid.
   */
  isValidData() {
    if (this.type === 'folder') {
      return true;
    }
    return this.data !== undefined;
  }

  /**
   * The function checks if the parent is valid.
   * @returns {boolean} true if the parent is valid, false otherwise
   */
  async validateParent() {
    if (this.parentId === 0) {
      return false;
    }
    // check if the parentId is a valid ObjectID string
    if (!ObjectId.isValid(this.parentId)) {
      return { error: 'Invalid parent ID' };
    }

    this.parentId = ObjectId(this.parentId);

    const parent = await this.filedb.findOne({ _id: this.parentId });
    if (!parent) {
      return { error: 'Parent not found' };
    }
    if (parent.type !== 'folder') {
      return { error: 'Parent is not a folder' };
    }
    return false;
  }

  /**
   * The function saves the file in the database.
   * @param {string} usersId
   * @returns
   */
  async save(usersId) {
    if (this.name === undefined) {
      return { error: 'Missing name' };
    }
    if (!this.isValidType()) {
      return { error: 'Missing type' };
    }
    if (!this.isValidData()) {
      return { error: 'Missing data' };
    }
    const validateParentResult = await this.validateParent();
    if (validateParentResult) {
      return validateParentResult;
    }
    if (this.type === 'folder') {
      const newFolder = await this.filedb.insertOne({
        userId: ObjectId(usersId),
        name: this.name,
        type: this.type,
        isPublic: this.isPublic,
        parentId: this.parentId,
      });
      return {
        id: newFolder.insertedId,
        userId: usersId,
        name: this.name,
        type: this.type,
        isPublic: this.isPublic,
        parentId: this.parentId,
      };
    }

    const localPath = `${this.FOLDER_PATH}/${uuidV4()}`;
    const buff = Buffer.from(this.data, 'base64');
    fs.mkdirSync(this.FOLDER_PATH, { recursive: true });
    fs.writeFileSync(localPath, buff);
    const newFile = await this.filedb.insertOne({
      userId: ObjectId(usersId),
      name: this.name,
      type: this.type,
      isPublic: this.isPublic,
      parentId: this.parentId,
      localPath,
    });
    if (this.type === 'image') {
      await fileQueue.add({
        fileId: newFile.insertedId,
        userId: usersId,
      });
    }

    return {
      id: newFile.insertedId,
      userId: usersId,
      name: this.name,
      type: this.type,
      isPublic: this.isPublic,
      parentId: this.parentId,
    };
  }

  /**
   *
   * @param {string} userId
   * @param {string} parentId
   * @param {number} page
   * @returns
   */
  async findAllUserFilesByParentId(userId, parentId, page) {
    let parentID = parentId;
    if (!ObjectId.isValid(userId)) {
      return { error: 'Invalid user ID' };
    }
    if (!ObjectId.isValid(parentID)) {
      return { error: 'Invalid parent ID' };
    }
    if (parentID !== 0) {
      parentID = ObjectId(parentId);
    }
    const query = { parentId: parentID, userId: ObjectId(userId) };
    const cursor = await this.filedb.find(query).skip(page * MAX_PAGE_SIZE).limit(MAX_PAGE_SIZE);
    let files = await cursor.toArray();
    files = files.map((file) => Files.removeLocalPath(file));
    return files;
  }

  /**
   * Removes the localPath property from a document object.
   *
   * @param {Object} document - The document object to remove localPath property
   * from.
   * @return {Object} A new document object without the localPath property.
   */
  static removeLocalPath(document) {
    const doc = { ...document };
    delete doc.localPath;
    return doc;
  }

  /**
     *
     * @param {string} userID
     * @param {string} id
     * @returns
     */
  async findUserFileById(userID, id) {
    if (!ObjectId.isValid(userID)) {
      return { error: 'Invalid user ID' };
    }
    if (!ObjectId.isValid(id)) {
      return { error: 'Invalid file ID' };
    }
    const query = { _id: ObjectId(id), userId: ObjectId(userID) };
    const file = await this.filedb.findOne(query);
    if (!file) {
      return { error: 'Not found' };
    }
    return file;
  }

  async updatePublic(userID, param, published) {
    const publicity = published === 'publish';

    if (!ObjectId.isValid(userID)) {
      return { error: 'Invalid user ID' };
    }
    if (!ObjectId.isValid(param)) {
      return { error: 'Invalid file ID' };
    }

    const filter = { _id: ObjectId(param), userId: ObjectId(userID) };
    const update = { $set: { isPublic: publicity } };

    const updateResult = await this.filedb.updateOne(filter, update);
    if (updateResult.matchedCount === 0) {
      return { error: 'Not found' };
    }

    const result = await this.filedb.findOne(filter);

    return Files.removeLocalPath(result);
  }

  async getData(userID, id) {
    if (!ObjectId.isValid(userID)) {
      return { error: 'Invalid user ID' };
    }
    if (!ObjectId.isValid(id)) {
      return { error: 'Invalid file ID' };
    }

    const file = await this.filedb.findOne({ _id: ObjectId(id), userId: ObjectId(userID) });
    if (!file) {
      return { error: 'Not found' };
    }

    return file;
  }

  async getPublic(id) {
    if (!ObjectId.isValid(id)) {
      return { error: 'Invalid file ID' };
    }

    const file = await this.filedb.findOne({ _id: ObjectId(id), isPublic: true });
    if (!file) {
      return { error: 'Not found' };
    }

    return file;
  }
}

export default Files;
