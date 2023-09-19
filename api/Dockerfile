# Docker file nodejs azure app services
FROM node:16
#Clone repo manually
RUN git clone https://github.com/Aravi4143/lms-public-services-project.git
# Create app directory
WORKDIR /app
# Install app dependencies
COPY package*.json ./
RUN npm install
COPY src/common/models/* ./build/common/models/
# Build app
COPY . .
RUN npx prisma generate
RUN npm run build
