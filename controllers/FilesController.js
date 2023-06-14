import fs from 'fs';
import mime from 'mime-types';
import User from '../utils/users';
import Files from '../utils/files';

class FilesController {
  static async validateToken(request, response) {
    const token = request.headers['x-token'];
    if (!token) {
      response.status(401).send({ error: 'Unauthorized' });
      return null;
    }
    const us = new User();
    const user = await us.findByToken(token);
    if (!user) {
      response.status(401).send({ error: 'Unauthorized' });
      return null;
    }
    return user;
  }

  static async postUpload(request, response) {
    const user = await FilesController.validateToken(request, response);
    if (user) {
      const file = new Files(
        request.body.name,
        request.body.type,
        request.body.data,
        request.body.parentId,
        request.body.isPublic,
      );
      const result = await file.save(user._id);
      response.status(result.error ? 400 : 201).send(result);
    }
  }

  static async getShow(request, response) {
    const user = await FilesController.validateToken(request, response);
    if (user) {
      const { id } = request.params;
      const file = new Files();
      let result = await file.findUserFileById(user._id, id);
      result = Files.removeLocalPath(result);
      response.status(result.error ? 404 : 200).send(result);
    }
  }

  static async getIndex(request, response) {
    const user = await FilesController.validateToken(request, response);
    if (user) {
      let { parentId, page } = request.query;
      if (parentId === '0' || !parentId) parentId = 0;
      page = Number.isNaN(page) ? 0 : Number(page);
      const file = new Files();
      const result = await file.findAllUserFilesByParentId(user._id, parentId, page);
      response.status(result.error ? 401 : 200).send(result);
    }
  }

  static async putPublish(request, response) {
    const user = await FilesController.validateToken(request, response);
    if (user) {
      const { id } = request.params;
      const file = new Files();
      const result = await file.updatePublic(user._id, id, request.url.split('/')[3]);
      response.status(result.error ? 401 : 200).send(result);
    }
  }

  static async putUnpublish(request, response) {
    const user = await FilesController.validateToken(request, response);
    if (user) {
      const { id } = request.params;
      const file = new Files();
      const result = await file.updatePublic(user._id, id, request.url.split('/')[3]);
      response.status(result.error ? 401 : 200).send(result);
    }
  }

  static async getFile(request, response) {
    const token = request.headers['x-token'];
    const { id } = request.params;
    if (!token) {
      const file = new Files();
      const result = await file.getPublic(id);
      FilesController.gettingFile(result, response, request);
    } else {
      const user = await FilesController.validateToken(request, response);
      if (user) {
        const file = new Files();
        const result = await file.getData(user._id, id);
        FilesController.gettingFile(result, response, request);
      }
    }
  }

  static async gettingFile(result, response, request) {
    const { size } = request.query;
    if (result.error) {
      return response.status(404).send(result); // add return here
    } if (result.type === 'folder') {
      return response.status(400).send({ error: "A folder doesn't have content" }); // add return here
    } if (!fs.existsSync(result.localPath)) {
      return response.status(404).send({ error: 'Not found' }); // add return here
    }
    const mimeType = mime.lookup(result.name);
    response.set('Content-Type', mimeType);

    if (result.type === 'image') {
      if (size) {
        const sizes = ['500', '250', '100'];
        if (sizes.includes(size)) {
          const thumbnailPath = `${result.localPath}_${size}`;
          if (fs.existsSync(thumbnailPath)) {
            return response.status(200).send(fs.readFileSync(thumbnailPath)); // add return here
          }
          return response.status(404).send({ error: 'Not found' }); // add return here
        }
      }
    }
    return response.status(200).send(fs.readFileSync(result.localPath)); // add return here
  }
}

export default FilesController;
