package apitest

type UserData struct {
	Message string `json:"message"`
	Name    string `json:"name"`
}

type LoginResponse struct {
	Status  int      `json:"status"`
	Success bool     `json:"success"`
	Message string   `json:"message"`
	Token   string   `json:"token"`
	User    UserData `json:"user"`
}

type RegisterResp struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
}

type ChannelData struct {
	ID                 int    `json:"id"`
	Channelname        string `json:"channelname"`
	Blocks             int    `json:"blocks"`
	ChannelGenesisHash string `json:"channel_genesis_hash"`
	Transactions       int    `json:"transactions"`
	Createdat          string `json:"createdat"`
	ChannelHash        string `json:"channel_hash"`
}

type ChannelsInfoResp struct {
	Status   int           `json:"status"`
	Channels []ChannelData `json:"channels"`
}

func (ch *ChannelsInfoResp) getChannelList() []string {
	chList := []string{}
	for _, val := range ch.Channels {
		chList = append(chList, val.Channelname)
	}
	return chList
}

func (ch *ChannelsInfoResp) getChannelData(channelID string) *ChannelData {
	var info *ChannelData
	for _, val := range ch.Channels {
		if val.Channelname == channelID {
			info = &val
			break
		}
	}
	return info
}

func (ch *ChannelsInfoResp) getGenesisHash(channelID string) string {
	var hash string
	for _, val := range ch.Channels {
		if val.Channelname == channelID {
			hash = val.ChannelGenesisHash
			break
		}
	}
	return hash
}

func (ch *ChannelsInfoResp) getBlockHeight(channelID string) int {

	var height int
	for _, val := range ch.Channels {
		if val.Channelname == channelID {
			height = val.Blocks
			break
		}
	}
	return height
}

type ChannelsResponse struct {
	Status   int      `json:"status"`
	Channels []string `json:"channels"`
}

type BlockData struct {
	Blocknum    int      `json:"blocknum"`
	Txcount     int      `json:"txcount"`
	Datahash    string   `json:"datahash"`
	Blockhash   string   `json:"blockhash"`
	Prehash     string   `json:"prehash"`
	Createdt    string   `json:"createdt"`
	Txhash      []string `json:"txhash"`
	Channelname string   `json:"channelname"`
}

type BlockActivityResp struct {
	Status int         `json:"status"`
	Row    []BlockData `json:"row"`
}

type BlockResp struct {
	Status       int           `json:"status"`
	Number       string        `json:"number"`
	PreviousHash string        `json:"previous_hash"`
	DataHash     string        `json:"data_hash"`
	Transactions []interface{} `json:"transactions"`
}

type PeersStatusResp struct {
	Status int           `json:"status"`
	Peers  []interface{} `json:"peers"`
}

type NetworklistInfo struct {
	NetworkList [][]interface{} `json:"networkList"`
}
