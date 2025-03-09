www.odyssey.com

### **Próximos Passos para Análise**

1. **Verificar Proprietário do IP**
    
    - Use o comando `whois` ou ferramentas online como [WhoisXML](https://whoisxmlapi.com/) para descobrir quem é o proprietário dos IPs:
        
        bash
        
        Copiar
        
        `whois 3.33.251.168 whois 15.197.225.128`
        
2. **Verificar Uso de Cloudflare ou Outro CDN**
    
    - Use o comando `curl` para verificar os cabeçalhos HTTP e identificar se o site usa Cloudflare ou outro CDN:
        
        bash
        
        Copiar
        
        `curl -I https://odyssey.com`
        
3. **Análise de Localização**
    
    - Use ferramentas como [IP Location](https://www.iplocation.net/) para determinar a localização geográfica dos IPs.

---

### **Exemplo de Organização das Informações**

| **Categoria**          | **Informação**                                           |
| ---------------------- | -------------------------------------------------------- |
| **Nome do Domínio**    | odyssey.com                                              |
| **CNAME**              | [www.odyssey.com](http://www.odyssey.com/) → odyssey.com |
| **Endereços IP**       | 3.33.251.168, 15.197.225.128                             |
| **Proprietário do IP** | (A ser preenchido)                                       |
| **Uso de CDN**         | (A ser preenchido)                                       |
gervao@odyssey:~$ whatweb www.odyssey.com
http://www.odyssey.com [403 Forbidden] Country[UNITED STATES][US], HTTPServer[awselb/2.0], IP[3.33.251.168], Title[403 Forbidden]
