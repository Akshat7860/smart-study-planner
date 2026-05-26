# 1. Base Image: Hum Node.js ka ek bana-banaya, halka (alpine) version le rahe hain
FROM node:18-alpine

# 2. Working Directory: Container ke andar ek '/app' naam ka folder bana rahe hain jahan sab code rahega
WORKDIR /app

# 3. Dependencies Copy: Sirf package.json file ko pehle copy kar rahe hain
COPY package*.json ./

# 4. Install: Node modules ko container ke andar install kar rahe hain
RUN npm install

# 5. Copy Code: Ab baaki ka saara backend code container mein copy kar lo (Pehla '.' tumhara laptop hai, dusra '.' container hai)
COPY . .

# 6. Expose Port: README ke hisaab se backend port 5000 par chalega, isliye is port ko open kar rahe hain
EXPOSE 5000

# 7. Start Command: Jab container start hoga, toh ye command chalegi
CMD ["npm", "start"]
