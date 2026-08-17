-- Ejecutar en Supabase SQL Editor
-- Tabla: user_preferences (favoritos de usuarios)

CREATE TABLE user_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Un usuario no puede marcar favorita la misma propiedad 2x
  UNIQUE(user_id, property_id)
);

-- Index para queries rápidas por user_id
CREATE INDEX idx_user_prefs_user_id ON user_preferences(user_id);

-- Index para queries por property_id (útil para estadísticas)
CREATE INDEX idx_user_prefs_property_id ON user_preferences(property_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_user_preferences_updated_at();

-- RLS: Solo el usuario puede ver/modificar sus propias preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- SOLO Milton puede leer todo para analytics
CREATE POLICY "Milton only can view all preferences for analytics"
  ON user_preferences FOR SELECT
  USING (auth.jwt() ->> 'email' = 'catalanmilton826@gmail.com');
