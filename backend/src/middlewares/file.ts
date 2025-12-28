import { Request, NextFunction, Response, Express } from 'express'
import multer, { FileFilterCallback } from 'multer'
import crypto from 'crypto'
import { join, extname } from 'path'
import fs from 'fs'
import BadRequestError from '../errors/bad-request-error'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

const manageDirectory = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
    }
}

const isSupportedFile = (fileType: string): boolean => {
    const fileTypes = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'image/gif',
        'image/svg+xml',
    ]
    return fileTypes.includes(fileType)
}

const storage = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: DestinationCallback
    ) => {
        const uploadPath = join(
            process.cwd(),
            'src',
            'public',
            process.env.UPLOAD_PATH_TEMP || 'temp'
        )
        
        manageDirectory(uploadPath)
        cb(null, uploadPath)
    },

    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: FileNameCallback
    ) => {
        const uniqueId = crypto.randomBytes(16).toString('hex')
        const uniqueName = `${uniqueId}${extname(file.originalname)}`
        cb(null, uniqueName)
    },
})

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    if (!isSupportedFile(file.mimetype)) {
        return cb(new BadRequestError('Недопустимый тип файла. Разрешены только изображения: PNG, JPG, JPEG, GIF, SVG'))
    }

    return cb(null, true)
}

export const validateFileSize = (minSize: number) => 
    (req: Request, _res: Response, next: NextFunction) => {
        if (req.file && req.file.size < minSize) {
            return next(new BadRequestError(`Файл слишком маленький (меньше ${minSize} байт)`))
        }
        next()
    }

export default multer({ storage, fileFilter, limits: {fileSize: 3 * 1024 * 1024} })
