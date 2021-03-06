import { Lobby } from "..";
import { BanchoResponseType, BanchoResponse } from "../parsers";
import { Player } from "../Player";
import { LobbyPlugin } from "./LobbyPlugin";
import config from "config";

export interface AutoStartTimerOption {
  enabled: boolean;
  doClearHost: boolean;
  waitingTime: number;
}

const WAITINGTIME_MIN = 15;

export class AutoStartTimer extends LobbyPlugin {
  option: AutoStartTimerOption;
  constructor(lobby: Lobby, option: Partial<AutoStartTimerOption> = {}) {
    super(lobby, "autostart");
    const d = config.get<AutoStartTimerOption>("AutoStartTimer");
    this.option = { ...d, ...option } as AutoStartTimerOption;
    this.registerEvents();
  }

  private registerEvents(): void {
    this.lobby.ReceivedChatCommand.on(a => this.onReceivedChatCommand(a.player, a.command, a.param));
    this.lobby.ReceivedBanchoResponse.on(a => this.onReceivedBanchoResponse(a.message, a.response));
  }

  private onReceivedChatCommand(player: Player, command: string, param: string): void {
    if (this.lobby.isMatching) return;
    if (!player.isAuthorized) return;
    switch (command) {
      case "*autostart_enable":
        this.option.enabled = true;
        break;
      case "*autostart_disable":
        this.option.enabled = false;
        break;
      case "*autostart_time":
        let ct = parseInt(param);
        if (Number.isNaN(ct)) {
          this.logger.warn("invalid *autostart_time param : %s", param);
        }
        if (ct < WAITINGTIME_MIN) {
          ct = WAITINGTIME_MIN;
        }
        this.option.waitingTime = ct;
        break;
      case "*autostart_clearhost_enable":
        this.option.doClearHost = true;
        break;
      case "*atuostart_clearhost_disable":
        this.option.doClearHost = false;
        break;
    }
  }

  private onReceivedBanchoResponse(message: string, response: BanchoResponse): void {
    if (!this.option.enabled || this.option.waitingTime < WAITINGTIME_MIN) return;

    switch (response.type) {
      case BanchoResponseType.BeatmapChanged:
        if (this.lobby.players.size == 1) break;
        this.SendPluginMessage("mp_start", [this.option.waitingTime.toString()]);
        if (this.option.doClearHost) {
          this.lobby.SendMessage(`!mp clearhost`);
        }
        break;
      case BanchoResponseType.BeatmapChanging:
      case BanchoResponseType.HostChanged:
        if (this.lobby.isStartTimerActive) {
          this.lobby.SendMessage("!mp aborttimer");
        }
        this.SendPluginMessage("mp_abort_start");
        break;
    }
  }
}