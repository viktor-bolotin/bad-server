import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export default function serveStatic(baseDir: string) {
    const resolvedDir = path.resolve(baseDir)

    return (req: Request, res: Response, next: NextFunction) => {
        const filePath = path.join(resolvedDir, req.path)
        const normalizedPath = path.normalize(filePath)

        if (!normalizedPath.startsWith(resolvedDir)) {
            return next()
        }

        fs.access(normalizedPath, fs.constants.F_OK, (err) => {
            if (err) {
                return next()
            }
            return res.sendFile(filePath, (sendErr) => {
                if (sendErr) {
                    next(sendErr)
                }
            })
        })
    }
}
