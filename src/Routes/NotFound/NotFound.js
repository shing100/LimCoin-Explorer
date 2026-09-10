import React, { Component } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Card, SectionTitle, PagerButton } from "Components/Shared";
import { setPageMeta } from "../../meta";
import { space, breakpoint } from "../../theme";

/*
 * 없는 주소로 들어왔을 때.
 *
 * 예전에는 <Redirect to="/" /> 로 조용히 홈에 보냈다. 주소를 잘못 친 사람은
 * 왜 홈에 와 있는지 모른 채 다시 치게 된다. 무엇이 잘못됐는지 말해 주고,
 * 여기서 바로 다시 찾을 수 있게 한다.
 */
const Body = styled.div`
  padding: ${space.huge} ${space.xl};
  text-align: center;

  @media (max-width: ${breakpoint.sm}) {
    padding: ${space.xxl} ${space.lg};
  }
`;

const Code = styled.p`
  margin: 0 0 ${space.sm};
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--accent);
`;

const Lead = styled.p`
  margin: 0 0 ${space.xs};
  font-size: 15px;
  font-weight: 600;
`;

const Hint = styled.p`
  margin: 0 0 ${space.xl};
  font-size: 13px;
  color: var(--textMuted);
  line-height: 1.7;
`;

const Path = styled.code`
  padding: 2px ${space.xs};
  border-radius: 4px;
  background: var(--surfaceSunken);
  font-family: inherit;
  overflow-wrap: anywhere;
`;

const Links = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${space.sm};
`;

class NotFound extends Component {
  componentDidMount() {
    setPageMeta("찾을 수 없는 주소", "요청한 주소가 없습니다.");
  }

  render() {
    const path = this.props.location ? this.props.location.pathname : "";
    return (
      <section>
        <SectionTitle>찾을 수 없습니다</SectionTitle>
        <Card>
          <Body>
            <Code>404</Code>
            <Lead>이런 주소는 없습니다.</Lead>
            <Hint>
              {path && (
                <React.Fragment>
                  <Path>{decodeURIComponent(path)}</Path>
                  <br />
                </React.Fragment>
              )}
              블록은 <Path>/block/&lt;해시&gt;</Path> 또는 <Path>/height/&lt;높이&gt;</Path>,
              트랜잭션은 <Path>/tx/&lt;id&gt;</Path>, 주소는 <Path>/address/&lt;주소&gt;</Path> 입니다.
              <br />
              위 검색창에 높이·해시·주소를 넣으면 알아서 찾아갑니다.
            </Hint>
            <Links>
              <PagerButton as={Link} to="/">홈</PagerButton>
              <PagerButton as={Link} to="/blocks">블록</PagerButton>
              <PagerButton as={Link} to="/transactions">트랜잭션</PagerButton>
            </Links>
          </Body>
        </Card>
      </section>
    );
  }
}

export default NotFound;
