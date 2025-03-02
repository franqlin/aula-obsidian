import axios from 'axios';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFolder } from 'obsidian';
import { exec } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';
import { Console } from 'console';
import { OdysseusPluginSettings, DEFAULT_SETTINGS, OdysseusPluginSettingTab } from './settings';
import * as fs from 'fs';
import { search, SafeSearchType } from 'duck-duck-scrape';


const execAsync = promisify(exec);
const ALLOW_FILE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "pdf"];
const START_MESSAGE = "Iniciar Sincronização!!";
const PROCESS_MESSAGE = "Media Sync in Process!!";
const END_MESSAGE = "Media Sync End!!";
const ERROR_MESSAGE = "Error Occurred!! Please retry.";
const SKIP_URLS = [
  "https://twitter.com/intent/tweet",
  "https://twitter.com/share",
  "https://search.yahoo.co.jp/search"
];

var import_obsidian2 = require("obsidian");
const duckduckgoSearch = require("duckduckgo-search");

const getFilePrefix = (): string => {
	return 'media';
  };
  const getRondomString = (): string => {
	return Math.floor(Math.random() * 1e5).toString().padStart(5, "0");
  };
  
  const getResorceFolderName = (app: App, settings: OdysseusPluginSettings): string => {
    let resourceFolderName = '';
    const activeFile = app.workspace.getActiveFile();
    if (activeFile) {
      const filePath = activeFile.path;
      const directoryPath = filePath.substring(0, filePath.lastIndexOf('/'));
      return directoryPath;
    }
    return resourceFolderName;
};

//const downloadFiles = async (data: any, files: any[], resorceFolderName: string, adapter: any, useCache = true) => 
var downloadFiles = async (data:any, files:any[], resorceFolderName:string, adapter:any, useCache = true) => {
	var _a, _b;
	if (!await adapter.exists(resorceFolderName)) {
	  adapter.mkdir(resorceFolderName);
	}
	let totalCount;
	if (useCache) {
	  totalCount = (_a = files.filter(
		(file) => {
		  var _a2;
		  return !((_a2 = data == null ? void 0 : data.files) == null ? void 0 : _a2.some((f: string) => f === file.name));
		}
	  )) == null ? void 0 : _a.length;
	} else {
	  totalCount = files.length;
	}
	let currentCount = 1;
	const errorUrls: string[] = [];
	for (const file of files) {
	  const isSkip = (_b = data == null ? void 0 : data.files) == null ? void 0 : _b.some((f: string) => f === file.name);
	  if (isSkip && useCache) {
		continue;
	  }
	  const currentNotice = new Notice(
		`${PROCESS_MESSAGE} (${currentCount}/${totalCount})`,
		0
	  );
	  let fileContent = await adapter.read(file.path);
	  const prefix = getFilePrefix();
	  const currentFileFolderPath = `${resorceFolderName}/${prefix}`;
	  const urlMatches = fileContent.match(/https?:\/\/([\w!?/\-_=.&%;:,])+/g);
	  if (urlMatches) {
		for (const urlMatche of urlMatches) {
		  if (errorUrls.some((url) => url === urlMatche)) {
			continue;
		  }
		  const hasSkipUrls = SKIP_URLS.some((url) => urlMatche.startsWith(url));
		  if (hasSkipUrls) {
			continue;
		  }
		  try {
			const response = await ( import_obsidian2.requestUrl)(urlMatche);
			const contentType = response.headers["content-type"];
			if (contentType.startsWith("image") || contentType === "application/pdf") {
			  if (!await adapter.exists(currentFileFolderPath)) {
				adapter.mkdir(currentFileFolderPath);
			  }
			  const extension = contentType.split("/")[1];
			  const isAllowExtension = ALLOW_FILE_EXTENSIONS.some(
				(ext) => extension.toLowerCase() === ext
			  );
			  let fileName = getRondomString();
			  const contentDisposition = response.headers["content-disposition"];
			  if (contentDisposition) {
				const fileNameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
				if (fileNameMatch) {
				  fileName = fileNameMatch[1];
				}
			  }
			  let filePath = `${currentFileFolderPath}/file_${fileName}`;
			  if (isAllowExtension) {
				filePath = `${filePath}.${extension}`;
			  } else {
				const realUrl = urlMatche.split("?")[0];
				const realExtention = ALLOW_FILE_EXTENSIONS.find(
				  (ext) => realUrl.toLowerCase().endsWith(ext)
				);
				if (realExtention) {
				  filePath = `${filePath}.${realExtention}`;
				} else {
				  continue;
				}
			  }
			  fileContent = fileContent.replace(urlMatche, `![[${filePath}]]`);
			  let fileNotePath = `${filePath}.md`;
			  await adapter.writeBinary(filePath, response.arrayBuffer);
			  await adapter.write(
				fileNotePath,
				`![[${filePath}]] From note: [[${file.path}]] Original url: ${urlMatche}`
			  );
			}
		  } catch (error) {
			console.log("access url error: " + urlMatche);
			console.log(error);
			errorUrls.push(urlMatche);
		  }
		}
	  }
	  await adapter.write(file.path, fileContent);
	  data.files.push(file.name);
	  currentNotice.hide();
	  currentCount++;
	}
  };
  
  const saveFiles = async (app: App, plugin: Plugin, settings: OdysseusPluginSettings, selectFiles: any[] = [], useCache = true) => {
	const notices = [];
	notices.push(new Notice(START_MESSAGE, 2e3));
	console.log(START_MESSAGE);
	notices.push(new Notice(PROCESS_MESSAGE, 2e3));
	console.log(PROCESS_MESSAGE);
	let data;
	try {
	  const dataJson = await plugin.loadData();
	  data = JSON.parse(dataJson);
	} catch (error) {
	  console.log("load data error");
	  console.log(error);
	}
	if (!data) {
	  data = {};
	}
	if (!data.files) {
	  data.files = [];
	}
	let files = [];
	if (selectFiles.length > 0) {
	  files = selectFiles;
	} else {
	  files = app.vault.getMarkdownFiles();
	}
	const resorceFolderName = getResorceFolderName(app, settings);
	await downloadFiles(
	  data,
	  files,
	  resorceFolderName,
	  app.vault.adapter,
	  useCache
	);
	try {
	  const saveData = JSON.stringify({ ...data, ...settings });
	  await plugin.saveData(saveData);
	} catch (error) {
	  console.log("save data error");
	  console.log(error);
	  notices.push(new Notice(ERROR_MESSAGE, 0));
	}
	notices.push(new Notice(END_MESSAGE, 0));
	await new Promise((r) => setTimeout(r, 2e3));
	notices.forEach((notice) => notice.hide());
	console.log(END_MESSAGE);
  };	
	
export default class OdysseusAPIPlugin extends Plugin {
	settings: OdysseusPluginSettings;
    
	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('horse', 'Odysseus::Enquecimento de Mídia"', (evt: MouseEvent) => {
			saveFiles(this.app, this, this.settings);
		});
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');
		this.addSettingTab(new OdysseusPluginSettingTab(this.app, this));
		
		this.addCommand({
			id: "media-sync-now",
			name: "Enriquecer Mídia",
			editorCallback: (editor: Editor, view: MarkdownView) => {
			  saveFiles(this.app, this, this.settings, [view.file], false);
			}
		  });
		  this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
			  menu.addItem((item) => {
				item.setTitle("Odysseus - Enriquecer Mídia").setIcon("horse").onClick(async () => {
				  if (file instanceof TFolder) {
					new Notice("A sincronização de mídia não suporta pastas.");
					return;
				  }
				  saveFiles(this.app, this, this.settings, [file], false);
				});
			  });
			})
		  );
		  this.addCommand({
			id: 'check-user-exists',
			name: 'Verificar Existência de Usuário em Sites',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const username = editor.getSelection().trim();
				if (!username) {
					new Notice('Por favor, selecione um nome de usuário para verificar.');
					return;
				}

				try {
					const sites = await loadSitesJson(this.settings.jsonFilePath);
					const results = await checkUserExists(sites, username, editor);
					const resultMessage = results.join('\n');
				   // editor.replaceSelection(resultMessage);
					new Notice('Lista de sites: ', 10000); // Mostrar resultados por 10 segundos
				} catch (error) {
					new Notice(`Erro: ${error}`);
				} 
			}
		});
        this.addCommand({
            id: 'buscar-por-real-time-web-search',
            name: 'Web Search',
            editorCallback: async (editor: Editor, view: MarkdownView) => {
                const query = editor.getSelection();
                const apiKey = this.settings.apiKeyRealTime;
                const limit = this.settings.limit;

                showWaitMessage();
                try {
                    const response = await fetchRealTimeWebSearchData(query, apiKey, limit);
                    const resultDiv = createResultDiv(`*Resultado da Busca Real-Time Web Search:* ${query}`);
                    editor.replaceSelection(resultDiv + formatarJsonParaObsidian(response));
                    new Notice('Busca Efetuada com sucesso');
                } catch (error) {
                    new Notice('Erro ao buscar dados do Real-Time Web Search');
                } finally {
                    removeWaitMessage();
                }
            }
        });
		this.addCommand({
            id: 'buscar-por-truecaller',
            name: 'Buscar por Truecaller',
            editorCallback: async (editor: Editor, view: MarkdownView) => {
                const phoneNumber = editor.getSelection().trim();
                if (!phoneNumber) {
                    new Notice('Por favor, selecione um número de telefone para buscar.');
                    return;
                }

                const waitDiv = document.createElement('div');
                waitDiv.id = 'waitMessage';
                waitDiv.style.position = 'fixed';
                waitDiv.style.top = '50%';
                waitDiv.style.left = '50%';
                waitDiv.style.transform = 'translate(-50%, -50%)';
                waitDiv.style.padding = '20px';
                waitDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                waitDiv.style.color = 'white';
                waitDiv.style.borderRadius = '5px';
                waitDiv.style.zIndex = '1000';
                waitDiv.innerText = 'Aguarde...';
                document.body.appendChild(waitDiv);

                try {
					const response = await fetchTruecallerData(phoneNumber, this.settings.apiKeyTruecaller, this.settings.apiHostTruecaller);
					//const resultMessage = JSON.stringify(response, null, 2);
					const format = formatarJsonParaObsidian(response);

					const reportHeader = `# Relatório de Busca Truecaller\n\n**Número de Telefone:** ${phoneNumber}\n**Data:** ${new Date().toLocaleDateString()}\n\n`;
					const formattedReport = reportHeader + format;
					
					editor.replaceSelection(formattedReport);
                    new Notice('Busca Efetuada com sucesso');
                } catch (error) {
                    new Notice('Erro ao buscar dados do Truecaller');
                } finally {
                    document.body.removeChild(waitDiv);
                }
            }
        });




async function fetchTruecallerData(phoneNumber: string, apiKey: string, apiHost: string): Promise<any> {
    const options = {
        method: 'GET',
        url: `https://truecaller-data2.p.rapidapi.com/search/${phoneNumber}`,
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': apiHost
        }
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        throw new Error(`Erro ao buscar dados do Truecaller: ${error.message}`);
    }
}
		async function fetchRealTimeWebSearchData(query: string, apiKey: string, limit: number): Promise<any> {
			try {
				const response = await fetch(`https://real-time-web-search.p.rapidapi.com/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
					method: 'GET',
					headers: {
						'X-Rapidapi-Key': apiKey,
						'X-Rapidapi-Host': 'real-time-web-search.p.rapidapi.com'
					}
				});
				if (!response.ok) {
					throw new Error(`Erro na requisição: ${response.statusText}`);
				}
				return await response.json();
			} catch (error) {
				throw new Error(`Erro na requisição: ${error.message}`);
			}
		}
		async function loadSitesJson(filePath: string): Promise<any> {
			return new Promise((resolve, reject) => {
				fs.readFile(filePath, 'utf8', (err, data) => {
					if (err) {
						reject(`Failed to load JSON file: ${err.message}`);
					} else {
						resolve(JSON.parse(data));
					}
				});
			});
		}
		async function checkUserExists(sites: any, username: string, editor: Editor): Promise<string[]> {
			const results: string[] = [];
			const headers = [
				"-H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'",
				"-H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'",
				"-H 'Accept-Encoding: gzip, deflate, br'",
				"-H 'Accept-Language: en-US,en;q=0.5'",
				"-H 'Connection: keep-alive'",
				"-H 'DNT: 1'",
				"-H 'Upgrade-Insecure-Requests: 1'"
			].join(' ');
			const createReportHeader = (username: string): string => {
				const date = new Date().toLocaleDateString();
				return `# Relatório de Verificação de Usuário\n\n**Usuário:** ${username}\n**Data:** ${date}\n\n`;
			};

			// Add this at the beginning of the checkUserExists function
			const header = createReportHeader(username);
			editor.replaceSelection(header);
			const terminalThemeCss = `
				body {
					background-color: #1e1e1e;
					color: #00ff00;
					font-family: 'Courier New', Courier, monospace;
				}
				.terminal-header {
					background-color: #333;
					color: #00ff00;
					padding: 10px;
					text-align: center;
					font-weight: bold;
				}
				.terminal-content {
					padding: 20px;
				}
			`;

			//const styleElement = document.createElement('style');
			//styleElement.innerHTML = terminalThemeCss;
			//document.head.appendChild(styleElement);

			//const terminalHeader = document.createElement('div');
			//terminalHeader.className = 'terminal-header';
			//terminalHeader.innerText = 'Terminal Output';

			//const terminalContent = document.createElement('div');
			//terminalContent.className = 'terminal-content';
			//terminalContent.innerText = 'Verificando sites...';

			//document.body.appendChild(terminalHeader);
			//document.body.appendChild(terminalContent);
			for (const [site, urlTemplate] of Object.entries(sites)) {
				const url = (urlTemplate as string).replace('{}', username);
				const cmd = `curl -s -o /dev/null -w "%{http_code}" ${headers} ${url}`;
				console.log(`Verificando ${site}: ${url}`);
				new Notice(`Verificando ${site}: ${url}`);
				const waitDiv = document.createElement('div');
				waitDiv.id = 'waitMessage';
				waitDiv.style.position = 'fixed';
				waitDiv.style.top = '50%';
				waitDiv.style.left = '50%';
				waitDiv.style.transform = 'translate(-50%, -50%)';
				waitDiv.style.padding = '20px';
				waitDiv.style.backgroundColor = 'black';
				waitDiv.style.color = 'lime';
				waitDiv.style.borderRadius = '5px';
				waitDiv.style.zIndex = '1000';
				waitDiv.style.fontFamily = 'monospace';
				waitDiv.innerText = `Verificando ${site}: ${url}`;
				document.body.appendChild(waitDiv);
				try {
					const { stdout } = await execAsync(cmd);
					const statusCode = parseInt(stdout.trim(), 10);
					if (statusCode === 200) {
						results.push(`Usuário encontrado em ${site}: ${url}`);
						console.log(`Usuário encontrado em ${site}: ${url}`);
						editor.replaceSelection(`${site}: ${url}\n`);
						new Notice(`Usuário encontrado em ${site}: ${url}`);
					} else {
						results.push(`Usuário não encontrado em ${site}: ${url}`);
						console.log(`Usuário não encontrado em ${site}: ${url}`);
						new Notice(`Usuário não encontrado em ${site}: ${url}`);
					}
				} catch (error) {
					results.push(`Erro ao verificar ${site}: ${error.message}`);
					console.log(`Erro ao verificar ${site}: ${error.message}`);
					new Notice(`Erro ao verificar ${site}: ${error.message}`);
				} finally {
					document.body.removeChild(waitDiv);
				}
			}
			return results;
		}


		function createResultDiv(text: string): string {
			return `*${text}*\n`;
		}
		function formatJsonToGraph(json: any, nivel: number = 0): string {
			let resultado = '';
			const espacos = ' '.repeat(nivel * 2); // Indentação
		
			for (const chave in json) {
				if (typeof json[chave] === 'object' && json[chave] !== null) {
					resultado += `${espacos}<div style="margin-left: ${nivel * 20}px;"><strong>${chave.toUpperCase()}</strong>:</div>\n`;
					resultado += formatJsonToGraph(json[chave], nivel + 1);
				} else {
					resultado += `${espacos}<div style="margin-left: ${nivel * 20}px;"><strong>${chave.toUpperCase()}</strong>: ${json[chave]}</div>\n`;
				}
			}
		
			return resultado;
		}
		
		function showWaitMessage() {
			const waitDiv = document.createElement('div');
			waitDiv.id = 'waitMessage';
			waitDiv.style.position = 'fixed';
			waitDiv.style.top = '50%';
			waitDiv.style.left = '50%';
			waitDiv.style.transform = 'translate(-50%, -50%)';
			waitDiv.style.padding = '20px';
			waitDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
			waitDiv.style.color = 'white';
			waitDiv.style.borderRadius = '5px';
			waitDiv.style.zIndex = '1000';
			waitDiv.innerText = 'Fazendo pesquisa...';
			document.body.appendChild(waitDiv);
		}
		function removeWaitMessage() {
			const waitDiv = document.getElementById('waitMessage');
			if (waitDiv) {
				document.body.removeChild(waitDiv);
			}
		}

        this.addCommand({
            id: 'buscar-por-whois',
            name: 'WHOIS',
            editorCallback: async (editor: Editor, view: MarkdownView) => {
                const query = editor.getSelection();
                showWaitMessage();
                try {
					const result = await fetchWhoisData(query);
					const jsonResult = parseWhoisOutput(result);
					const resultDiv = createResultDiv(`*Resultado da Busca WHOIS:* ${query}`);
					const formattedResult = formatarJsonParaObsidian(jsonResult);
					editor.replaceSelection(resultDiv + formattedResult);
                } catch (error) {
                    new Notice('Erro ao buscar dados do WHOIS');
                } finally {
                    removeWaitMessage();
                }
            }
        });
	
		async function fetchWhoisData(query: string): Promise<string> {
			try {
				
				const { stdout, stderr } = await execAsync(`whois ${query}`);
				if (stderr) {
					throw new Error(stderr);
				}
				return stdout;
			} catch (error) {
				throw new Error(`Erro na requisição: ${error.message}`);
			}
		}
		
		
		function parseWhoisOutput(output: string): Record<string, string> {
			const lines = output.split('\n');
			const result: Record<string, string> = {};
		
			lines.forEach(line => {
				const [key, ...value] = line.split(':');
				if (key && value.length > 0) {
					result[key.trim()] = value.join(':').trim();
				}
			});
		
			return result;
		}
;


		
		this.addCommand({
			id: 'buscar-instagram',
			name: 'Instagram',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const query = editor.getSelection();
				showWaitMessage();
				try {
					const result = await fetchInstagramData(query, this);
					const resultDiv = createResultDiv(`*Resultado da Busca Instagram:* ${query}`);
					console.log(result.data)
					const imageUrl = result.data.profile_pic_url;
					const caption = `Foto Perfil`;
					const imageResultMarkdown = createImageResultMarkdown(imageUrl, caption);
					const formattedResult = formatResultToPortuguese(result.data,4);
					
					function formatResultToPortuguese(json: any, nivel: number = 0): string {
						let resultado = '';
						const espacos = ' '.repeat(nivel * 2); // Indentação

						for (const chave in json) {
							const chaveFormatada = chave.replace(/_/g, ' ').toUpperCase();
							if (typeof json[chave] === 'object' && json[chave] !== null) {
								resultado += `${espacos}- **${chaveFormatada}**:\n`;
								resultado += formatResultToPortuguese(json[chave], nivel + 1);
							} else {
								resultado += `${espacos}- **${chaveFormatada}**: ${json[chave]}\n`;
							}
						}

						return resultado;
					}

					editor.replaceSelection(resultDiv + imageResultMarkdown+formattedResult);
					new Notice('Busca Efetuada com sucesso');
				} catch (error) {
					new Notice('Erro ao buscar dados do Instagram');
				} finally {
					removeWaitMessage();
				}
			}
		});
		function createImageResultMarkdown(imageUrl: string, caption: string): string {
			return `${imageUrl}\n`;
		}
		
		function fetchInstagramData(username: string,plugin:OdysseusAPIPlugin): Promise<any> {
			return new Promise((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				const url = `https://instagram-scraper-api2.p.rapidapi.com/v1/info?username_or_id_or_url=${username}`;
				
				xhr.open('GET', url);
				xhr.setRequestHeader('x-rapidapi-key', plugin.settings.rapidApiKey);
				xhr.setRequestHeader('x-rapidapi-host', plugin.settings.rapidApiHost);
				
				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						resolve(JSON.parse(xhr.responseText));
					} else {
						reject(new Error(`Erro na requisição: ${xhr.statusText}`));
					}
				};
				
				xhr.onerror = () => reject(new Error('Erro na requisição'));
				
				xhr.send();
			});
		}

            const  apiService = new ApiService(this.app);
		
			this.addCommand({
				id: 'buscar-por-cnpj-receita',
				name: 'Busca por CNPJ - Receita Federal',
				editorCallback: async (editor: Editor, view: MarkdownView) => {
					console.log(editor.getSelection());
					const cnpj = editor.getSelection().replace(/[^\d]/g, '');
					const comandoToken = `curl -k -s -o -X GET https://www.receitaws.com.br/v1/cnpj/${cnpj}`;
                    showWaitMessage();
					const resultado = await executarCurl(comandoToken);
					removeWaitMessage();
					const json_ = JSON.parse(resultado);
					const resultadoFormatado = formatarJsonParaObsidian(json_);
					console.log(resultadoFormatado);
					editor.replaceSelection(`*Resultado da Busca:* ${cnpj}\n${resultadoFormatado}`);
				}
			});

			this.addCommand({
					id: 'buscar-por-ip',
					name: 'Busca dados do IP',
					editorCallback: async (editor: Editor, view: MarkdownView) => {
						showWaitMessage();
						await apiService.fetchIPData(editor);
						removeWaitMessage();
					}
				});

		

		// This adds a settings tab so the user can configure various aspects of the plugin
		//this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}
  async syncMedia(notePath: string) {
   
	
}
async loadSettings() {
    try {
        const data = await this.loadData();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    } catch (error) {
        console.error("Error loading settings:", error);
        this.settings = DEFAULT_SETTINGS;
    }
}

	async saveSettings() {
		await this.saveData(this.settings);
	}
	
}



const formatarJsonParaObsidian = (json: any, nivel: number = 0): string => {
    let resultado = '';
    const espacos = ' '.repeat(nivel * 2); // Indentação

    for (const chave in json) {
        if (typeof json[chave] === 'object' && json[chave] !== null) {
            resultado += `${espacos}- **${chave.toLocaleUpperCase()}**:\n`;
            resultado += formatarJsonParaObsidian(json[chave], nivel + 1);
        } else {
            resultado += `${espacos}- **${chave.toUpperCase()}**: ${json[chave]}\n`;
        }
    }

    return resultado;
};

async function executarCurl(cmd: string): Promise<string> {
    try {
        const { stdout, stderr } = await execAsync(cmd, { maxBuffer: 1024 * 1024 * 50 }); // 10 MB

        if (stderr) {
            throw new Error(`Erro na saída padrão: ${stderr}`);
        }

        return stdout;
    } catch (error) {
        throw new Error(`Erro ao executar curl: ${error.message}`);
    }
}
function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class ApiService {
	private app: App;
	 	
		constructor(app: App) {
			this.app = app;
		}
	
	
	private  async executeHttpRequest(url: string): Promise<any> {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Erro na requisição: ${error.message}`);
            } else {
                throw new Error(`Erro inesperado: ${error}`);
            }
        }
    }
	public  async fetchIPData(editor: Editor): Promise<void> {
        try {
            const ip = editor.getSelection();
            const url = `https://ipinfo.io/${ip}/json`;

            const data = await this.executeHttpRequest(url);
            console.log('Dados do IP/DNS:', data);

            const resultadoFormatado = this.formatJsonResult(data);
            console.log(resultadoFormatado);

            editor.replaceSelection('*Resultado da Busca:* ' + '\n' + resultadoFormatado);
        } catch (error) {
            console.error(error.message);
        }
    }
	
	private  formatCNPJ(cnpj: string): string {

        return cnpj.replace(/[^\d]/g, '');
    }
	private  formatJsonResult(json: any): string {
        return formatarJsonParaObsidian(json);
    }
	private  async executeCurlCommand(command: string): Promise<string> {
        try {
            const { stdout, stderr } = await execAsync(command, { maxBuffer: 1024 * 1024 * 50 }); // 50 MB

            if (stderr) {
                throw new Error(`Erro na saída padrão: ${stderr}`);
            }

            return stdout;
        } catch (error) {
            throw new Error(`Erro ao executar curl: ${error.message}`);
        }
    }
	
}

