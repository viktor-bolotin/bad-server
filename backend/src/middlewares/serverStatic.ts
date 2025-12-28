import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export default function serveStatic(baseDir: string) {
    const resolvedDir = path.resolve(baseDir)

    return (req: Request, res: Response, next: NextFunction) => {
        // Определяем полный путь к запрашиваемому файлу
        const filePath = path.join(resolvedDir, req.path)
        const normalizedPath = path.normalize(filePath)

        if (!normalizedPath.startsWith(resolvedDir)) {
            return next()
        }

        // Проверяем, существует ли файл
        fs.access(normalizedPath, fs.constants.F_OK, (err) => {
            if (err) {
                // Файл не существует отдаем дальше мидлварам
                return next()
            }
            // Файл существует, отправляем его клиенту
            return res.sendFile(filePath, (sendErr) => {
                if (sendErr) {
                    next(sendErr)
                }
            })
        })
    }
}
