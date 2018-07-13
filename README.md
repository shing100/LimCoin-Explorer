# LimCoin-explorer

bulit in React LimCoin explorer

# 라이브러리
- react, react-dom, react-router-dom, react-scripts
- prop-types
- typography
- styled, styled-components, styled-reset
- axios
- cors
- lodash.flatten, lodash.sum

---
## Version infomation

    "axios": "^0.18.0",
    "cors": "^2.8.4",
    "lodash.flatten": "^4.4.0",
    "lodash.sum": "^4.0.2",
    "prop-types": "^15.6.1",
    "react": "^16.4.1",
    "react-dom": "^16.4.1",
    "react-router-dom": "^4.3.1",
    "react-scripts": "1.1.4",
    "styled": "^1.0.0",
    "styled-components": "^3.3.2",
    "styled-reset": "^1.3.5",
    "typography": "^0.16.17"

## 기능
기능으로는 LimCoin의 Block, Transaction 을 볼 수 있음

Server 에서 Block , Transaction을 받아오는 Class

    ``
    class AppContainer extends Component {
    state = {
        isLoading: true
    };
    componentDidMount = () => {
        this._getData();
        this._connectToWs();
    }
    render() {
        baseStyles();
        return <AppPresenter {...this.state} />;
    }
    _getData = async() => {
        const request = await axios.get(`${API_URL}/blocks`);
        //console.log(request);
        const blocks = request.data;
        const reversedBlocks = blocks.reverse();
        const txs = flatten(reversedBlocks.map(block => block.data));
        this.setState({
        blocks: reversedBlocks,
        transactions: txs,
        isLoading: false
        });
    };
    _connectToWs = () => {
        const ws = new WebSocket(WS_USL);
        try{
        ws.addEventListener("message", message => {
            const parsedMessage = parseMessage(message);
            if(parsedMessage !== null && parsedMessage !== undefined){
            this.setState(prevState => {
                return {
                    ...prevState,
                    blocks: [...parsedMessage, ...prevState.blocks],
                    transactions: [...parsedMessage[0].data, ...prevState.transactions]
                }
            })
            }
        });
        }catch(e){
            console.log(e);
            ws.close();
        }
    };
    }
    ``