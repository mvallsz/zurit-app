# Usa la imagen oficial de Node.js como base para construir la aplicación
FROM node:14 as build

# Establece el directorio de trabajo
WORKDIR /app

# Copia el package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install --legacy-peer-deps

# Copia el resto del código de la aplicación
COPY . .

# Construye la aplicación Angular
RUN npm run build --prod

# Usa una imagen de Nginx para servir la aplicación
FROM nginx:alpine

# Copia los archivos construidos desde la etapa anterior
COPY --from=build /dist/ /usr/share/nginx/html


# Copia el script de configuración de entorno
COPY ./set-env.sh /usr/share/nginx/html/set-env.sh

# Copia la configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto en el que corre la aplicación
EXPOSE 80

# Comando para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]
