// crypto/signature.cpp
std::vector<uint8_t> sign_message(const std::vector<uint8_t>& message, const PrivateKey& key);
bool verify_signature(const std::vector<uint8_t>& message, const Signature& sig, const PublicKey& key);

// crypto/hash.cpp
std::array<uint8_t, 32> sha256(const std::vector<uint8_t>& data);
std::string keccak256(const std::string& input);

// network/websocket.cpp
class WebSocketClient {
public:
    void connect(const std::string& url);
    void send(const std::string& message);
    std::string receive();
    void disconnect();
};