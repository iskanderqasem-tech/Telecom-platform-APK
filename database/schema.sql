CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  subscription_plan VARCHAR(50) DEFAULT 'MVP',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL DEFAULT 'TESTER',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  device_label VARCHAR(100),
  device_identifier VARCHAR(255) UNIQUE NOT NULL,
  device_secret_hash VARCHAR(255),
  imei VARCHAR(50),
  msisdn VARCHAR(50),
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  android_version VARCHAR(50),
  network_operator VARCHAR(100),
  status VARCHAR(50) DEFAULT 'OFFLINE',
  battery_level INTEGER,
  signal_strength INTEGER,
  network_type VARCHAR(50),
  ip_address VARCHAR(100),
  last_seen TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  websocket_session_id VARCHAR(255),
  connected_at TIMESTAMP DEFAULT NOW(),
  disconnected_at TIMESTAMP,
  status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  test_name VARCHAR(255) NOT NULL,
  test_type VARCHAR(100) NOT NULL,
  description TEXT,
  configuration JSONB DEFAULT '{}'::jsonb,
  expected_result TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  test_case_id UUID REFERENCES test_cases(id) ON DELETE SET NULL,
  started_by UUID REFERENCES users(id),
  execution_status VARCHAR(50) DEFAULT 'QUEUED',
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS execution_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES executions(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'A_PARTY',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  execution_id UUID REFERENCES executions(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  result_status VARCHAR(20) DEFAULT 'PENDING',
  actual_result TEXT,
  expected_result TEXT,
  execution_log TEXT,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  report_name VARCHAR(255),
  report_type VARCHAR(50),
  generated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  execution_id UUID REFERENCES executions(id) ON DELETE SET NULL,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  command_type VARCHAR(100),
  payload JSONB DEFAULT '{}'::jsonb,
  command_status VARCHAR(50) DEFAULT 'QUEUED',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_heartbeats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  battery_level INTEGER,
  signal_strength INTEGER,
  network_type VARCHAR(50),
  ip_address VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_customer ON devices(customer_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_msisdn ON devices(msisdn);
CREATE INDEX IF NOT EXISTS idx_test_cases_customer ON test_cases(customer_id);
CREATE INDEX IF NOT EXISTS idx_executions_customer ON executions(customer_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON executions(execution_status);
CREATE INDEX IF NOT EXISTS idx_results_customer ON results(customer_id);
CREATE INDEX IF NOT EXISTS idx_results_status ON results(result_status);
CREATE INDEX IF NOT EXISTS idx_heartbeats_device ON agent_heartbeats(device_id);
