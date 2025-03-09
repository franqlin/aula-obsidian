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
~$ whatweb www.odyssey.com
http://www.odyssey.com [403 Forbidden] Country[UNITED STATES][US], HTTPServer[awselb/2.0], IP[3.33.251.168], Title[403 Forbidden]

https://www.whatweb.net/
**Resultado da Busca WHOIS:* 15.197.225.128*
- **# AVAILABLE AT**: https://www.arin.net/resources/registry/whois/tou/
- **# HTTPS**: //www.arin.net/resources/registry/whois/inaccuracy_reporting/
- **NETRANGE**: 15.196.0.0 - 15.200.255.255
- **CIDR**: 15.196.0.0/14, 15.200.0.0/16
- **NETNAME**: AT-88-Z
- **NETHANDLE**: NET-15-196-0-0-1
- **PARENT**: NET15 (NET-15-0-0-0-0)
- **NETTYPE**: Direct Allocation
- **ORIGINAS**: 
- **ORGANIZATION**: Amazon Technologies Inc. (AT-88-Z)
- **REGDATE**: 2011-12-08
- **UPDATED**: 2024-01-24
- **COMMENT**: * Your contact details (phone and email) Without these we will be unable to identify the correct owner of the IP address at that point in time.
- **REF**: https://rdap.arin.net/registry/entity/AT-88-Z
- **ORGNAME**: Amazon Technologies Inc.
- **ORGID**: AT-88-Z
- **ADDRESS**: 410 Terry Ave N.
- **CITY**: Seattle
- **STATEPROV**: WA
- **POSTALCODE**: 98109
- **COUNTRY**: US
- **ORGTECHHANDLE**: ANO24-ARIN
- **ORGTECHNAME**: Amazon EC2 Network Operations
- **ORGTECHPHONE**: +1-206-555-0000
- **ORGTECHEMAIL**: amzn-noc-contact@amazon.com
- **ORGTECHREF**: https://rdap.arin.net/registry/entity/ANO24-ARIN
- **ORGABUSEHANDLE**: AEA8-ARIN
- **ORGABUSENAME**: Amazon EC2 Abuse
- **ORGABUSEPHONE**: +1-206-555-0000
- **ORGABUSEEMAIL**: trustandsafety@support.aws.com
- **ORGABUSEREF**: https://rdap.arin.net/registry/entity/AEA8-ARIN
- **ORGNOCHANDLE**: AANO1-ARIN
- **ORGNOCNAME**: Amazon AWS Network Operations
- **ORGNOCPHONE**: +1-206-555-0000
- **ORGNOCEMAIL**: amzn-noc-contact@amazon.com
- **ORGNOCREF**: https://rdap.arin.net/registry/entity/AANO1-ARIN
- **ORGROUTINGHANDLE**: ARMP-ARIN
- **ORGROUTINGNAME**: AWS RPKI Management POC
- **ORGROUTINGPHONE**: +1-206-555-0000
- **ORGROUTINGEMAIL**: aws-rpki-routing-poc@amazon.com
- **ORGROUTINGREF**: https://rdap.arin.net/registry/entity/ARMP-ARIN
