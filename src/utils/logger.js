// Sistema de logging para substituir console.warn
class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.DEV;
  }

  // Log de erro com fallback
  error(message, error = null, context = {}) {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context);
    }
    
    // Em produção, você pode enviar para um serviço de monitoramento
    // como Sentry, LogRocket, etc.
    if (!this.isDevelopment && error) {
      // Exemplo: Sentry.captureException(error, { extra: context });
    }
  }

  // Log de warning
  warn(message, data = null) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, data);
    }
  }

  // Log de informação
  info(message, data = null) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, data);
    }
  }

  // Log de debug
  debug(message, data = null) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }
}

// Instância singleton do logger
export const logger = new Logger();

// Função helper para logging de erros de API com fallback
export const logApiError = (functionName, error, fallbackData = null) => {
  logger.error(
    `${functionName} failed, using fallback data`,
    error,
    { fallbackData, timestamp: new Date().toISOString() }
  );
};