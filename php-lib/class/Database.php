<?php

class Database {
    private PDO $pdo;

    /**
     * コンストラクタ：データベース接続を確立する
     * @param string $host データベースホスト名
     * @param string $name データベース名
     * @param string $user データベースユーザー名
     * @param string $pass データベースパスワード
     */
    public function __construct(
        ?string $db_host = null,
        ?string $db_name = null,
        ?string $db_user = null,
        ?string $db_pass = null
    ) {
        $db_host = $db_host ?? getenv("DB_HOST");
        $db_name = $db_name ?? getenv("DB_NAME");
        $db_user = $db_user ?? getenv("DB_USER");
        $db_pass = $db_pass ?? getenv("DB_PASSWORD");
        $dsn = "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        try {
            $this->pdo = new PDO($dsn, $db_user, $db_pass, $options);
        } catch (PDOException $e) {
            throw new PDOException("Database connection failed: " . $e->getMessage(), (int)$e->getCode());
        }
    }

    /**
     * SELECT文などの結果を返すクエリを実行する
     *
     * @param string $sql SQL文
     * @param array $params パラメータの連想配列
     * @return array 取得した結果の連想配列
     */
    public function query(string $sql, array $params = []): array {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            // クエリエラーを呼び出し元にスロー
            throw new PDOException("Database query failed: " . $e->getMessage(), (int)$e->getCode());
        }
    }

    /**
     * INSERT, UPDATE, DELETEなどのデータ操作クエリを実行する
     *
     * @param string $sql SQL文
     * @param array $params パラメータの連想配列
     * @return int 影響を受けた行数
     */
    public function execute(string $sql, array $params = []): int {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            // クエリエラーを呼び出し元にスロー
            throw new PDOException("Database execute failed: " . $e->getMessage(), (int)$e->getCode());
        }
    }
    
    /**
     * 最後に挿入されたIDを取得する
     *
     * @return string 最後に挿入されたID
     */
    public function lastInsertId(): string {
        return $this->pdo->lastInsertId();
    }

    /**
     * INSERT文を実行する
     *
     * @param string $table テーブル名
     * @param array $data 挿入するカラムと値の連想配列 ['column1' => 'value1', 'column2' => 'value2']
     * @return int 挿入された行数
     */
    public function insert(string $table, array $data): int {
        if (empty($data)) {
            return 0;
        }
        $columns = implode(', ', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data)); 
        $sql = "INSERT INTO $table ($columns) VALUES ($placeholders)";
        return $this->execute($sql, $data);
    }

    /**
     * UPDATE文を実行する
     *
     * @param string $table テーブル名
     * @param array $data 更新するカラムと値の連想配列 ['column1' => 'value1', 'column2' => 'value2']
     * @param array $where 条件句の連想配列 ['id' => 1]
     * @return int 更新された行数
     */
    public function update(string $table, array $data, array $where): int {
        if (empty($data) || empty($where)) {
            return 0;
        }
        $set_parts = [];
        foreach ($data as $key => $value) {
            $set_parts[] = "$key = :$key";
        }
        $set_clause = implode(', ', $set_parts);
        $where_parts = [];
        foreach ($where as $key => $value) {
            $where_parts[] = "$key = :_w_$key";
        }
        $where_clause = implode(' AND ', $where_parts);
        $sql = "UPDATE $table SET $set_clause WHERE $where_clause";
        $params = $data;
        foreach ($where as $key => $value) {
            $params["_w_$key"] = $value;
        }
        return $this->execute($sql, $params);
    }

    /**
     * DELETE文を実行する
     *
     * @param string $table テーブル名
     * @param array $where 条件句の連想配列 ['id' => 1]
     * @return int 削除された行数
     */
    public function delete(string $table, array $where): int {
        if (empty($where)) {
            return 0;
        }
        $where_parts = [];
        foreach ($where as $key => $value) {
            $where_parts[] = "$key = :$key";
        }
        $where_clause = implode(' AND ', $where_parts);
        $sql = "DELETE FROM $table WHERE $where_clause";
        return $this->execute($sql, $where);
    }

    /**
     * SELECT文を実行する
     *
     * @param string $table テーブル名
     * @param array $options 検索オプションの連想配列
     * - 'columns' (string|array): 取得するカラム。デフォルトは'*'
     * - 'where' (array): WHERE句の条件 ['id' => 1, 'status' => 'active']
     * - 'limit' (int): 取得する件数
     * - 'offset' (int): 取得開始位置
     * - 'order_by' (string): ORDER BY句
     * @return array 取得した結果の連想配列
     */
    public function select(string $table, array $options = []): array {
        $options = array_merge([
            'columns' => '*',
            'where' => [],
            'limit' => null,
            'offset' => null,
            'order_by' => null,
        ], $options);
        $columns = is_array($options['columns']) ? implode(', ', $options['columns']) : $options['columns'];
        $sql = "SELECT $columns FROM $table";
        $params = [];
        if (!empty($options['where'])) {
            $where_parts = [];
            foreach ($options['where'] as $key => $value) {
                $where_parts[] = "$key = :$key";
                $params[$key] = $value;
            }
            $sql .= " WHERE " . implode(' AND ', $where_parts);
        }
        if ($options['order_by']) {
            $sql .= " ORDER BY " . $options['order_by'];
        }
        if ($options['limit']) {
            $sql .= " LIMIT " . (int)$options['limit'];
            if ($options['offset']) {
                $sql .= " OFFSET " . (int)$options['offset'];
            }
        }
        return $this->query($sql, $params);
    }

    /**
     * SELECT文を比較演算子付きで実行する
     *
     * @param string $table テーブル名
     * @param array $options 検索オプションの連想配列
     * - 'columns' (string|array): 取得するカラム。デフォルトは'*'
     * - 'where' (array): WHERE句の条件。連想配列のキーはカラム名、値は比較演算子と値の連想配列 ['age' => ['>', 20]]
     * - 'limit' (int): 取得する件数
     * - 'offset' (int): 取得開始位置
     * - 'order_by' (string): ORDER BY句
     * @return array 取得した結果の連想配列
     */
    public function selectCompare(string $table, array $options = []): array {
        $options = array_merge([
            'columns' => '*',
            'where' => [],
            'limit' => null,
            'offset' => null,
            'order_by' => null,
        ], $options);
        
        $columns = is_array($options['columns']) ? implode(', ', $options['columns']) : $options['columns'];
        $sql = "SELECT $columns FROM $table";
        $params = [];
        
        if (!empty($options['where'])) {
            $where_parts = [];
            // 許可する比較演算子を定義
            $allowed_operators = ['>', '<', '>=', '<=', '=', '!='];
            foreach ($options['where'] as $key => $value) {
                // valueが配列であり、演算子と値の両方が含まれていることを確認
                if (is_array($value) && count($value) === 2) {
                    $operator = $value[0];
                    $val = $value[1];
                    // 演算子が許可されているか確認
                    if (in_array($operator, $allowed_operators)) {
                        // プレースホルダーの重複を避けるため、一意なキーを生成
                        $param_key = str_replace('.', '_', $key);
                        $where_parts[] = "`$key` $operator :$param_key";
                        $params[$param_key] = $val;
                    } else {
                        // 無効な演算子
                        throw new InvalidArgumentException("Invalid operator: " . $operator);
                    }
                } else {
                    // 通常の等価比較として扱う
                    $param_key = str_replace('.', '_', $key);
                    $where_parts[] = "`$key` = :$param_key";
                    $params[$param_key] = $value;
                }
            }
            $sql .= " WHERE " . implode(' AND ', $where_parts);
        }
        
        if ($options['order_by']) {
            $sql .= " ORDER BY " . $options['order_by'];
        }
        
        if ($options['limit']) {
            $sql .= " LIMIT " . (int)$options['limit'];
            if ($options['offset']) {
                $sql .= " OFFSET " . (int)$options['offset'];
            }
        }
        
        return $this->query($sql, $params);
    }

    // --- トランザクション関連メソッド ---

    /**
     * トランザクションを開始する
     * @return bool
     */
    public function begin(): bool {
        return $this->pdo->beginTransaction();
    }

    /**
     * トランザクションをコミットする
     * @return bool
     */
    public function commit(): bool {
        return $this->pdo->commit();
    }

    /**
     * トランザクションをロールバックする
     * @return bool
     */
    public function rollback(): bool {
        return $this->pdo->rollBack();
    }
}