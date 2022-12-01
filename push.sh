version=0.0.8

aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 280413110545.dkr.ecr.ap-northeast-2.amazonaws.com

docker build --platform=linux/amd64 -t panki-explorer-customized:${version} . 
docker tag panki-explorer-customized:${version} 280413110545.dkr.ecr.ap-northeast-2.amazonaws.com/panki-explorer-customized:${version}
docker push 280413110545.dkr.ecr.ap-northeast-2.amazonaws.com/panki-explorer-customized:${version}



