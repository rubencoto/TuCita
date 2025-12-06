# ?? Guía de Configuración de Dominio - www.tucitaonline.org

## Información del Dominio

- **Dominio Principal**: tucitaonline.org
- **Subdominio WWW**: www.tucitaonline.org
- **Plataforma de Hosting**: Heroku
- **Certificado SSL**: Automático (Heroku ACM)

## ?? Configuración DNS Paso a Paso

### Paso 1: Obtener DNS Target de Heroku

Después de agregar el dominio a Heroku, obtendrás un DNS target. Para verlo:

```bash
heroku domains -a tucita-app
```

Verás algo como:
```
Domain Name           DNS Target
??????????????????????????????????????????????
www.tucitaonline.org  xxx-yyy-zzz.herokudns.com
tucitaonline.org      xxx-yyy-zzz.herokudns.com
```

### Paso 2: Configurar Registros DNS

Accede al panel de control de tu proveedor de DNS (donde compraste el dominio) y configura:

#### Opción A: Configuración con CNAME (Recomendado para WWW)

```
Tipo: CNAME
Nombre/Host: www
Valor/Target: [Tu DNS target de Heroku]
TTL: 3600 (1 hora)
```

#### Opción B: Configuración para Dominio Raíz

**Si tu proveedor soporta ALIAS/ANAME:**
```
Tipo: ALIAS o ANAME
Nombre/Host: @ (o dejarlo vacío)
Valor/Target: [Tu DNS target de Heroku]
TTL: 3600
```

**Si NO soporta ALIAS/ANAME (solo tiene A y CNAME):**

Opción 1 - Usar WWW como principal:
```
# Redirección
Tipo: URL Redirect / Forward
De: tucitaonline.org
A: https://www.tucitaonline.org
```

Opción 2 - Usar IP de Heroku (no recomendado):
```
# Consultar IPs de Heroku y configurar registros A
# No recomendado porque las IPs pueden cambiar
```

### Paso 3: Configuración Completa Recomendada

```
# WWW (CNAME)
Tipo: CNAME
Host: www
Valor: xxx-yyy-zzz.herokudns.com
TTL: 3600

# Dominio raíz - Opción 1: ALIAS (si está disponible)
Tipo: ALIAS
Host: @
Valor: xxx-yyy-zzz.herokudns.com
TTL: 3600

# Dominio raíz - Opción 2: Redirección (alternativa)
Tipo: URL Redirect
De: tucitaonline.org
A: https://www.tucitaonline.org
Código: 301 (Permanent)
```

## ?? Verificación de Configuración DNS

### Usando nslookup

```bash
# Verificar WWW
nslookup www.tucitaonline.org

# Verificar dominio raíz
nslookup tucitaonline.org
```

### Usando dig (Linux/Mac)

```bash
# Verificar CNAME de WWW
dig www.tucitaonline.org CNAME

# Verificar registros A del dominio raíz
dig tucitaonline.org A
```

### Usando herramientas online

- https://dnschecker.org
- https://www.whatsmydns.net
- https://mxtoolbox.com/DNSLookup.aspx

## ?? Tiempos de Propagación

- **Mínimo**: 5-30 minutos
- **Promedio**: 2-4 horas
- **Máximo**: 24-48 horas

?? **Tip**: Usa modo incógnito o limpia la caché DNS para verificar cambios más rápido.

## ?? SSL/HTTPS

### Activación Automática de SSL

Heroku activa SSL automáticamente usando Let's Encrypt. El proceso:

1. Agregas el dominio a Heroku
2. Configuras el DNS correctamente
3. Esperas que el DNS se propague
4. Heroku detecta el dominio y emite el certificado SSL (automático)
5. ¡Listo! Tu sitio estará disponible en HTTPS

### Verificar Estado del Certificado

```bash
# Ver estado de certificados
heroku certs:auto -a tucita-app

# Ver información detallada
heroku certs:auto:info -a tucita-app
```

### Forzar HTTPS

La aplicación ya está configurada para redirigir HTTP a HTTPS en producción (ver `Program.cs`).

## ?? Configuración por Proveedor

### GoDaddy

1. Ve a "Mis Productos" ? "DNS"
2. Clic en "Administrar DNS"
3. Agregar/Editar registros:
   - CNAME: `www` ? `xxx-yyy.herokudns.com`
   - Forwarding: `tucitaonline.org` ? `https://www.tucitaonline.org`

### Namecheap

1. Ve a "Domain List" ? Clic en "Manage"
2. "Advanced DNS" tab
3. Agregar registros:
   - CNAME Record: Host `www`, Value `xxx-yyy.herokudns.com`
   - URL Redirect: `@` ? `https://www.tucitaonline.org`

### Cloudflare

1. Ve a "DNS" en el dashboard
2. Agregar registros:
   - Type: `CNAME`, Name: `www`, Content: `xxx-yyy.herokudns.com`, Proxy: OFF
   - Type: `CNAME`, Name: `@`, Content: `www.tucitaonline.org`, Proxy: OFF

?? **Importante**: Desactiva el proxy de Cloudflare (icono naranja) o configura Page Rules para SSL.

### Google Domains

1. Ve a "DNS" en la configuración del dominio
2. "Registros de recursos personalizados"
3. Agregar:
   - Tipo: `CNAME`, Nombre: `www`, Datos: `xxx-yyy.herokudns.com`
   - Tipo: `Redireccionamiento sintético`, De: `tucitaonline.org`, A: `https://www.tucitaonline.org`

## ?? Solución de Problemas

### Problema: "DNS target not found"

**Solución**:
1. Verifica que agregaste el dominio a Heroku: `heroku domains -a tucita-app`
2. Si no aparece, agrégalo: `heroku domains:add www.tucitaonline.org -a tucita-app`

### Problema: "SSL not ready"

**Solución**:
1. Verifica que el DNS esté configurado correctamente
2. Espera que el DNS se propague (hasta 48 horas)
3. Verifica estado: `heroku certs:auto -a tucita-app`
4. Si después de 48h no funciona: `heroku certs:auto:refresh -a tucita-app`

### Problema: "Too many redirects"

**Solución**:
1. Si usas Cloudflare, desactiva el proxy (modo DNS only)
2. O configura SSL en modo "Full" en Cloudflare
3. Verifica que no tengas múltiples redirecciones configuradas

### Problema: El dominio raíz no funciona

**Solución**:
1. Verifica si tu proveedor soporta ALIAS/ANAME records
2. Si no, usa redirección URL a www
3. Alternativamente, usa un servicio como Cloudflare que soporta CNAME flattening

## ? Checklist de Configuración

- [ ] Dominio agregado a Heroku
- [ ] DNS target obtenido de Heroku
- [ ] Registro CNAME para WWW configurado
- [ ] Redirección o ALIAS para dominio raíz configurado
- [ ] DNS propagado (verificado con dnschecker.org)
- [ ] SSL activo (verificar con navegador)
- [ ] Ambas URLs funcionan: http y https
- [ ] Redirección HTTP ? HTTPS activa
- [ ] Redirección tucitaonline.org ? www.tucitaonline.org activa

## ?? Comandos Útiles

```bash
# Ver dominios configurados
heroku domains -a tucita-app

# Agregar dominio
heroku domains:add www.tucitaonline.org -a tucita-app

# Eliminar dominio
heroku domains:remove www.tucitaonline.org -a tucita-app

# Ver certificados SSL
heroku certs:auto -a tucita-app

# Forzar renovación de certificado
heroku certs:auto:refresh -a tucita-app

# Ver información detallada
heroku certs:auto:info -a tucita-app
```

## ?? URLs Finales

Después de la configuración completa:

- **Desarrollo**: http://localhost:5000
- **Heroku (temporal)**: https://tucita-app.herokuapp.com
- **Producción WWW**: https://www.tucitaonline.org ?
- **Producción Raíz**: https://tucitaonline.org ? redirige a WWW

---

**Nota**: Esta guía asume que ya completaste los pasos en `DEPLOYMENT.md`
