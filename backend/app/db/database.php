<?php

// All functions that use the database
class Database
{
    // Database connection info
    private $db_host = DATABASE_HOST; // IP/Domain of your database server
    private $db_name = DATABASE_NAME; // Database name
    private $db_username = DATABASE_USER; // User for the database
    private $db_password = DATABASE_PASSWORD; // Password for the database User

    // Inserts the uptime data into the database
    // $d0 = Response Time, $d1 = Status (Online/Offline), $d2 = Timestamp, $d3 = Table Name
    public function insertLastUptimeInfo($d0, $d1, $d2, $d3)
    {
        $conn = new mysqli($this->db_host, $this->db_username, $this->db_password, $this->db_name);

        $stmt = $conn->prepare("INSERT INTO `$d3` (`resp_time`, `status`, `timestamp`) VALUES (?, ?, ?)");

        $stmt->bind_param("iss", $d0, $d1, $d2);

        $stmt->execute();

        $stmt->close();
        $conn->close();
    }

    // Get a comma seperated list of response times over the last 24H
    public function responseTime24H($d0)
    {
        $case = 0;
        $conn = new mysqli($this->db_host, $this->db_username, $this->db_password, $this->db_name);

        // If this service exists in the database
        if ($this->table_exists($d0, $conn)) {
            $last24H = date("Y-m-d H:i:s", strtotime("-1 day"));
            $timeNow = date("Y-m-d H:i:s");
            $data = array();

            $sql = "SELECT * FROM `$d0` WHERE timestamp BETWEEN '$last24H' AND '$timeNow'";

            $result = $conn->query($sql);

            // There is a chance that the table can have no data, here that case is handled
            if (is_object($result)) {
                if ($result->num_rows > 0) {
                    $i = 0;
                    while ($row = $result->fetch_assoc()) {
                        array_push($data, [strtotime($row["timestamp"] . ' ' . date_default_timezone_get()) * 1000, $row["resp_time"]]);
                        $i++;
                    }
                    $case = 1;
                }
            }
            $conn->close();
        }

        if ($case) {
            return $this->sendResponseTime($data);
        } else {
            return false;
        }
    }

    private function sendResponseTime($data)
    {
        if (empty(array_filter($data))) {
            exit('All values are 0');
        } else {
            return $data;
        }
    }

    // Get the average uptime over the last 24H
    public function averageResponseTime24h($d0)
    {
        $case = 0;
        $conn = new mysqli($this->db_host, $this->db_username, $this->db_password, $this->db_name);

        // If this service exists in the database
        if ($this->table_exists($d0, $conn)) {
            $last24H = date("Y-m-d H:i:s", strtotime("-1 day"));
            $timeNow = date("Y-m-d H:i:s");
            $data = array();

            $sql = "SELECT * FROM `$d0` WHERE timestamp BETWEEN '$last24H' AND '$timeNow'";

            $result = $conn->query($sql);

            // There is a chance that the table can have no data, here that case is handled
            if (is_object($result)) {
                if ($result->num_rows > 0) {
                    while ($row = $result->fetch_assoc()) {
                        array_push($data, $row["resp_time"]);
                    }
                    $case = 1;
                }
            }
            $conn->close();
        }

        if ($case) {
            return $this->sendAverageResponseTime($data);
        } else {
            return false;
        }
    }

    private function sendAverageResponseTime($data)
    {
        $data = array_filter($data);
        if (array_sum($data) === 0) {
            return '0 ms';
        } else {
            return round(array_sum($data) / count($data), 0) . ' ms';
        }
    }

    // Get uptime over the last 24H
    public function uptime24H($d0)
    {
        $case = 0;
        $conn = new mysqli($this->db_host, $this->db_username, $this->db_password, $this->db_name);

        // If this service exists in the database
        if ($this->table_exists($d0, $conn)) {
            $last24H = date("Y-m-d H:i:s", strtotime("-1 day"));
            $timeNow = date("Y-m-d H:i:s");
            $upCount = 0;
            $downCount = 0;

            $sql = "SELECT * FROM `$d0` WHERE timestamp BETWEEN '$last24H' AND '$timeNow'";

            $result = $conn->query($sql);

            // There is a chance that the table can have no data, here that case is handled
            if (is_object($result)) {
                if ($result->num_rows > 0) {
                    while ($row = $result->fetch_assoc()) {
                        if ($row["status"] != 0) {
                            $upCount++;
                        } else {
                            $downCount++;
                        }
                    }
                    $case = 1;
                }
            }
            $conn->close();
        }

        if ($case) {
            return $this->sendUptime($upCount, $downCount);
        } else {
            return false;
        }
    }

    private function sendUptime($d0, $d1)
    {
        if (number_format(($d0 / ($d0 + $d1)) * 100, 0) == 100) {
            return number_format(($d0 / ($d0 + $d1)) * 100, 0) . '%';
        } else {
            return number_format(($d0 / ($d0 + $d1)) * 100, 2) . '%';
        }
    }

    // Get the last time uptime was checked
    public function lastChecked($d0)
    {
        $lastCheck = null;
        $case = 0;
    
        $conn = new mysqli($this->db_host, $this->db_username, $this->db_password, $this->db_name);

        // If this service exists in the database
        if ($this->table_exists($d0, $conn)) {
            $sql = "SELECT timestamp FROM `$d0` ORDER BY id DESC LIMIT 1";
    
            $result = $conn->query($sql);
    
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $lastCheck = strtotime($row["timestamp"] . ' ' . date_default_timezone_get()) * 1000;
                }
                $case = 1;
            }
            $conn->close();
    
            if ($case) {
                return $this->sendLastChecked($lastCheck);
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    private function sendLastChecked($d0)
    {
        return $d0;
    }

    // Get the current Online/Offline status of a service
    public function serviceStatus($d0)
    {
        $case = 0;
        $conn = new mysqli($this->db_host, $this->db_username, $this->db_password, $this->db_name);

        // If this service exists in the database
        if ($this->table_exists($d0, $conn)) {
            $serviceStatus = null;

            $sql = "SELECT status FROM `$d0` ORDER BY id DESC LIMIT 1";

            $result = $conn->query($sql);

            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $serviceStatus = number_format($row["status"]);
                }
                $case = 1;
            }
            $conn->close();
        }

        if ($case) {
            return $this->sendServiceStatus($serviceStatus);
        } else {
            return false;
        }
    }

    private function sendServiceStatus($d0)
    {
        if ($d0 == 1) {
            return "ONLINE";
        } else {
            return "OFFLINE";
        }
    }

    // Determine whether a domain is fully configured
    public function isDomainConfigured($d0)
    {
        $conn = new mysqli($this->db_host, $this->db_username, $this->db_password, $this->db_name);

        if ($this->table_exists($d0, $conn)) {
            return true;
        } else {
            return false;
        }
    }

    // Will not overwrite data, only creates table if it does not exist
    public function createTablesFromConfig($d0)
    { // $d0 = Table Name
        $conn = new mysqli($this->db_host, $this->db_username, $this->db_password, $this->db_name);

        if (!$this->table_exists($d0, $conn)) {
            $sql = "CREATE TABLE `$d0` (`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, `resp_time` INT(4) NOT NULL, `status` BOOLEAN NOT NULL, `timestamp` DATETIME NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB";

            if ($conn->query($sql) === true) {
                echo "Table $d0 created successfully.<br>";
            } else {
                echo "Error creating table $d0. <br>Error info:<br>" . $conn->error . '<br>';
            }
        } else {
            echo "Skipping table $d0 as it already exists.<br>";
        }

        $conn->close();
    }

    private function table_exists($d0, $conn)
    { // $d0 = Table name
        if ($result = $conn->query("SHOW TABLES LIKE '" . $d0 . "'")) {
            if ($result->num_rows == 1) {
                return true;
            }
        } else {
            return false;
        }
    }
}
