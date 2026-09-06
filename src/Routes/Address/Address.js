import React, { Component, Fragment } from "react";
import { getBalance } from "../../api";
import { formatLim } from "../../units";
import { Card, SectionTitle, Detail, DKey, DValue, Back, Empty } from "Components/Shared";

class Address extends Component {
  state = { balance: null, error: null, loading: true };

  componentDidMount() {
    this._load();
  }

  componentDidUpdate(prev) {
    if (prev.match.params.address !== this.props.match.params.address) {
      this._load();
    }
  }

  _load = async () => {
    const { address } = this.props.match.params;
    this.setState({ loading: true, error: null });
    try {
      const { balance } = await getBalance(address);
      this.setState({ balance, loading: false });
    } catch (e) {
      this.setState({
        loading: false,
        error: e.response ? e.response.data : e.message
      });
    }
  };

  render() {
    const { balance, error, loading } = this.state;
    const { address } = this.props.match.params;

    if (loading) {
      return <Empty>불러오는 중…</Empty>;
    }

    return (
      <Fragment>
        <Back to="/">← 홈</Back>
        <SectionTitle>주소</SectionTitle>
        <Card>
          {error ? (
            <Empty>{error}</Empty>
          ) : (
            <Detail>
              <DKey>주소</DKey>
              <DValue mono>{address}</DValue>
              <DKey>잔액</DKey>
              <DValue>{formatLim(balance)} LIM</DValue>
            </Detail>
          )}
        </Card>
      </Fragment>
    );
  }
}

export default Address;
