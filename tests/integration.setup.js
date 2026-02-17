/**
 * Integration test setup — mocks ALL external dependencies
 * so the full Express app can load without real connections.
 * 
 * Import this at the top of integration test files BEFORE requiring app.
 */

// ─── AWS S3 ───
jest.mock('@aws-sdk/client-s3', () => {
    return {
        S3: jest.fn(() => ({
            putObject: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({}) }),
            getObject: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({}) }),
            deleteObject: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({}) }),
        })),
        S3Client: jest.fn(() => ({})),
        PutObjectCommand: jest.fn(),
        GetObjectCommand: jest.fn(),
        DeleteObjectCommand: jest.fn(),
    };
});

// ─── Multer S3 ───
jest.mock('multer-s3', () => {
    return jest.fn(() => ({
        _handleFile: jest.fn(),
        _removeFile: jest.fn(),
    }));
});

// ─── Multer (file upload) ───
jest.mock('multer', () => {
    const multer = jest.fn(() => ({
        single: jest.fn(() => (req, res, next) => next()),
        array: jest.fn(() => (req, res, next) => next()),
        fields: jest.fn(() => (req, res, next) => next()),
        any: jest.fn(() => (req, res, next) => next()),
    }));
    multer.memoryStorage = jest.fn();
    multer.diskStorage = jest.fn();
    return multer;
});

// ─── Sequelize ORM ───
const mockModel = {
    findOne: jest.fn(), findAll: jest.fn(), create: jest.fn(),
    update: jest.fn(), destroy: jest.fn(), count: jest.fn(),
    belongsTo: jest.fn(), hasMany: jest.fn(), hasOne: jest.fn(),
    belongsToMany: jest.fn(), addHook: jest.fn(), rawAttributes: {},
    findAndCountAll: jest.fn(), bulkCreate: jest.fn(),
};
jest.mock('../config/db', () => ({
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
    define: jest.fn(() => ({ ...mockModel })),
    literal: jest.fn((val) => val),
    query: jest.fn(), random: jest.fn(), models: {},
}));

// ─── Redis ───
jest.mock('../config/redis', () => ({
    isReady: true,
    ping: jest.fn().mockResolvedValue('PONG'),
    connect: jest.fn().mockResolvedValue(true),
    get: jest.fn().mockResolvedValue(null), // Default miss
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    quit: jest.fn().mockResolvedValue(true),
    flushAll: jest.fn().mockResolvedValue('OK'),
    ttl: jest.fn().mockResolvedValue(-1),
    expire: jest.fn().mockResolvedValue(1),
}));

// ─── Firebase Admin SDK ───
jest.mock('firebase-admin', () => ({
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    auth: jest.fn(() => ({
        getUser: jest.fn(), createUser: jest.fn(), deleteUser: jest.fn(),
    })),
}));

// ─── Firebase config ───
jest.mock('../config/firebaseConfig', () => ({}));

// ─── Google OAuth config ───
jest.mock('../config/OAuthGoogle', () => ({
    verifyIdToken: jest.fn().mockResolvedValue({}),
}));

// ─── Elasticsearch ───
jest.mock('../config/esClient', () => ({
    ping: jest.fn().mockResolvedValue(true),
    search: jest.fn(), bulk: jest.fn(),
    indices: { create: jest.fn(), exists: jest.fn(), delete: jest.fn() },
}));

// ─── Wooffer ───
jest.mock('wooffer', () => {
    const mock = jest.fn();
    mock.requestMonitoring = (req, res, next) => next();
    mock.fail = jest.fn();
    return mock;
});

// ─── Nodemailer ───
jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
        sendMail: jest.fn().mockResolvedValue(true),
    })),
}));

// ─── Sharp ───
jest.mock('sharp', () => {
    return jest.fn(() => ({
        resize: jest.fn().mockReturnThis(),
        webp: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        png: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock')),
        toFile: jest.fn().mockResolvedValue({}),
    }));
});

// ─── OpenAI ───
jest.mock('openai', () => {
    return jest.fn(() => ({
        chat: { completions: { create: jest.fn() } },
    }));
});

// Set required env vars
process.env.BUCKET = 'test-bucket';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = 'test-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@test.com';
process.env.SMTP_PASS = 'test-pass';
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.API_KEY_DEV = 'test-api-key';
