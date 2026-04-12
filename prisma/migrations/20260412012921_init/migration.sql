-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title_en" TEXT NOT NULL,
    "title_es" TEXT NOT NULL,
    "description_en" TEXT,
    "description_es" TEXT,
    "images" TEXT NOT NULL DEFAULT '[]',
    "projectType" TEXT DEFAULT 'web',
    "techStack" TEXT NOT NULL DEFAULT '[]',
    "githubUrl" TEXT,
    "liveUrl" TEXT,
    "client" TEXT,
    "year" INTEGER,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title_en" TEXT NOT NULL,
    "title_es" TEXT NOT NULL,
    "description_en" TEXT,
    "description_es" TEXT,
    "icon" TEXT,
    "image" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
