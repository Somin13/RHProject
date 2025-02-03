const { PrismaClient } = require('@prisma/client')
const express = require('express')
const messageRouter = express('express').Router()
const prisma = new PrismaClient