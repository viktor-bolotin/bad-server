import { Router } from 'express'
import { uploadFile } from '../controllers/upload'
import fileMiddleware, { validateFileSize } from '../middlewares/file'

const uploadRouter = Router()
uploadRouter.post('/', fileMiddleware.single('file'), validateFileSize(2 * 1024), uploadFile)

export default uploadRouter
