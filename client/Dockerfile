# 1. Base Image
FROM node:18-alpine

# 2. Working Directory
WORKDIR /app

# 3. Copy dependencies
COPY package*.json ./

# 4. Install Node modules
RUN npm install

# 5. Copy saara frontend code
COPY . .

# 6. Expose Vite Port (README ke hisaab se frontend 5173 par hai)
EXPOSE 5173

# 7. Start Command (Vite ko network par expose karne ke liye --host lagana zaroori hota hai Docker mein)
CMD ["npm", "run", "dev", "--", "--host"]
