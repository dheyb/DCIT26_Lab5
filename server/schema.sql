CREATE TABLE IF NOT EXISTS users (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(255) NOT NULL,
  username   VARCHAR(100) UNIQUE NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  phone      VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id    INT PRIMARY KEY,
  full_name  VARCHAR(255),
  email      VARCHAR(255),
  phone      VARCHAR(20),
  address    TEXT,
  bio        TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id               VARCHAR(50) PRIMARY KEY,
  user_id          INT NOT NULL,
  total            DECIMAL(10,2) NOT NULL,
  status           VARCHAR(30)  DEFAULT 'PENDING',
  payment_method   VARCHAR(20)  NOT NULL,
  delivery_address TEXT         NOT NULL,
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  order_id   VARCHAR(50) NOT NULL,
  item_id    INT NOT NULL,
  item_name  VARCHAR(255) NOT NULL,
  quantity   INT NOT NULL,
  price      DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  user_id    INT NOT NULL,
  item_id    INT NOT NULL,
  rating     INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
