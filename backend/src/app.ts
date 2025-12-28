import { errors } from 'celebrate'
import { nestCsrf } from 'ncsrf'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import fs from 'fs'
import { limiter } from './middlewares/limiter'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const { PORT = 3000, ORIGIN_ALLOW } = process.env
const app = express()

const createUploadDirectories = () => {
    const srcPublicDir = path.join(process.cwd(), 'src', 'public')
    const imagesDir = path.join(srcPublicDir, process.env.UPLOAD_PATH || 'images')
    const tempDir = path.join(srcPublicDir, process.env.UPLOAD_PATH_TEMP || 'temp')
    const directories: string[] = [srcPublicDir, tempDir, imagesDir]
    directories.forEach((dir: string) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
    })
    return tempDir
}
createUploadDirectories()

app.use(cookieParser())
app.use(nestCsrf())
app.use(cors({ 
    origin: ORIGIN_ALLOW || 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['Content-Length', 'Content-Type']
}));
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
}))

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true }))
app.use(json())

app.use('/auth', limiter)
app.use('/products', limiter)
app.use('/orders', limiter)
app.use('/customers', limiter)

app.options('*', cors())

app.use(routes)

app.use(errors())
app.use(errorHandler)

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
