// settings.ts
import { App, PluginSettingTab, Setting } from 'obsidian';

export interface OdysseusPluginSettings {
    rapidApiKey: string;
    rapidApiHost: string;
    saveDirectory: string;
	resourceFolderName: string;
  jsonFilePath: string;
  apiKeyRealTime: string;
  limit: number;
  apiKeyTruecaller: string;
  apiHostTruecaller: string;
}

export const DEFAULT_SETTINGS: OdysseusPluginSettings = {
    rapidApiKey: '',
    rapidApiHost: 'instagram-scraper-api2.p.rapidapi.com',
    saveDirectory: "_media-sync_resources",
	  resourceFolderName: "",
    jsonFilePath: "",
    apiKeyRealTime: '',
    limit: 300,
    apiKeyTruecaller: '',
    apiHostTruecaller: 'truecaller-data2.p.rapidapi.com'

};
var SaveDirectory = {
  Default: "_media-sync_resources",
  AttachmentFolderPath: "attachmentFolderPath",
  UserDefined: "resourceFolderName"
};

export class OdysseusPluginSettingTab extends PluginSettingTab {
    plugin: any;

    constructor(app: App, plugin: any) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Configurações do Plugin' });

        new Setting(containerEl)
            .setName('RapidAPI Key')
            .setDesc('Insira sua chave de API do (instagram-scraper-api2)')
            .addText(text => text
                .setPlaceholder('Insira sua chave de API')
                .setValue(this.plugin.settings.rapidApiKey)
                .onChange(async (value) => {
                    this.plugin.settings.rapidApiKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('RapidAPI Host')
            .setDesc('Insira o host da API do RapidAPI')
            .addText(text => text
                .setPlaceholder('Insira o host da API')
                .setValue(this.plugin.settings.rapidApiHost)
                .onChange(async (value) => {
                    this.plugin.settings.rapidApiHost = value;
                    await this.plugin.saveSettings();
                }));

                new Setting(containerEl)
                .setName("Pasta de armazenamento")
                .setDesc("Especifique uma pasta para armazenar as imagens.")
                .addDropdown((dropdown) => {
                  dropdown.addOption(SaveDirectory.Default, "Default")
                    .addOption(SaveDirectory.AttachmentFolderPath, "Pasta de anexos do Obsidian")
                    .addOption(SaveDirectory.UserDefined, "Pasta customizada")
                    .setValue(this.plugin.settings.saveDirectory)
                    .onChange(async (value) => {
                      this.plugin.settings.saveDirectory = value;
                      await this.saveSettings();
                      if (value === SaveDirectory.UserDefined) {
                        customFolderSetting.setDisabled(false);
                      } else {
                        customFolderSetting.setDisabled(true);
                        const input = customFolderSetting.settingEl.querySelector("input");
                        if (input) {
                          input.value = "";
                          this.plugin.settings.resourceFolderName = "";
                          await this.saveSettings();
                        }
                      }
                    });
                });
              const customFolderSetting = new Setting(containerEl)
                .setName("Nome da pasta customizada")
                .setDesc("Especifique o nome da pasta onde as mídias serão salvas.")
                .addText((text) => {
                  text.setPlaceholder("Custom folder name")
                    .setValue(this.plugin.settings.resourceFolderName)
                    .onChange(async (value) => {
                      this.plugin.settings.resourceFolderName = value;
                      await this.saveSettings();
                    })
                    .setDisabled(true);
                });
                new Setting(containerEl)
                .setName('Caminho do arquivo JSON')
                .setDesc('Caminho para o arquivo JSON contendo a lista de sites.')
                .addText(text => text
                  .setPlaceholder('Insira o caminho para o arquivo JSON')
                  .setValue(this.plugin.settings.jsonFilePath)
                  .onChange(async (value) => {
                    this.plugin.settings.jsonFilePath = value;
                    await this.plugin.saveSettings();
                  }));
                    new Setting(containerEl)
                    .setName('Chave API para Pesquisa Web em Tempo Real')
                    .setDesc('Chave API para Pesquisa Web em Tempo Real')
                    .addText(text => text
                      .setPlaceholder('Insira sua chave API')
                      .setValue(this.plugin.settings.rapidApiKey)
                      .onChange(async (value) => {
                        this.plugin.settings.apiKeyRealTime = value;
                        await this.plugin.saveSettings();
                      }));
              
                  new Setting(containerEl)
                    .setName('Limite para resultados de Pesquisa Web em Tempo Real')
                    .setDesc('Limite para resultados de Pesquisa Web em Tempo Real')
                    .addText(text => text
                      .setPlaceholder('Insira o limite')
                      .setValue(this.plugin.settings.limit.toString())
                      .onChange(async (value) => {
                          this.plugin.settings.limit = parseInt(value) || 300;
                          await this.plugin.saveSettings();
                      }));
                      new Setting(containerEl)
                      .setName('Chave API para Truecaller')
                      .setDesc('Chave API para Truecaller')
                      .addText(text => text
                          .setPlaceholder('Insira sua chave API')
                          .setValue(this.plugin.settings.apiKeyTruecaller)
                          .onChange(async (value) => {
                              this.plugin.settings.apiKeyTruecaller = value;
                              await this.plugin.saveSettings();
                          }));
          
                  new Setting(containerEl)
                      .setName('Host API para Truecaller')
                      .setDesc('Host API para Truecaller')
                      .addText(text => text
                          .setPlaceholder('Insira o host API')
                          .setValue(this.plugin.settings.apiHostTruecaller)
                          .onChange(async (value) => {
                              this.plugin.settings.apiHostTruecaller = value;
                              await this.plugin.saveSettings();
                          }));      
    }
     async saveSettings() {
    try {
      let data;
      try {
        data = await this.plugin.loadData();
      } catch (error) {
        console.error("load data error");
        console.error(error);
      }
      let saveData;
      if (data) {
        saveData = JSON.stringify({
          ...JSON.parse(data),
          ...this.plugin.settings
        });
      } else {
        saveData = JSON.stringify({
          ...this.plugin.settings
        });
      }
      await this.plugin.saveData(saveData);
    } catch (error) {
      console.error("save data error");
      console.error(error);
    }
  }
}