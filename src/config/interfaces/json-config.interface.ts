export type ScriptTrigger = {
  on: 'user-registered';
  action: string;
  modules?: Record<string, string>;
};

export interface JSONConfig {
  triggers?: ScriptTrigger[];
}
