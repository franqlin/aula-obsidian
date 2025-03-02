#!/bin/bash

# Verifica se o arquivo wmn-data.json existe
if [ ! -f wmn-data.json ]; then
    echo "Arquivo wmn-data.json não encontrado!"
    exit 1
fi

# Extrai os campos name e uri_check e cria um novo arquivo JSON
jq -r '.sites | map({(.name): .uri_check}) | add' wmn-data.json > extracted-data.json

# Formata o arquivo JSON no formato desejado
jq -r 'to_entries | map("\"" + .key + "\": \"" + .value + "\",") | .[]' extracted-data.json > formatted-data.json

# Adiciona chaves de abertura e fechamento ao arquivo JSON
echo "{" > final-data.json
cat formatted-data.json >> final-data.json
echo "}" >> final-data.json

# Remove a última vírgula do arquivo JSON
sed -i '$ s/,$//' final-data.json

# Remove arquivos temporários
rm extracted-data.json formatted-data.json

echo "Arquivo final-data.json criado com sucesso!"