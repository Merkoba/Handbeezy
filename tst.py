import os
import boto3
from boto3.s3.transfer import S3Transfer

spaces_client = boto3.session.Session().client('s3',
      endpoint_url='https://nyc3.digitaloceanspaces.com')

spaces_transfer = S3Transfer(spaces_client)

root = os.path.dirname(os.path.abspath(__file__))

#print root

#print spaces_client.Bucket('hbv')

#spaces_transfer.upload_file(root + '/hello.test', 'merkoba', 'test/hello4.test', extra_args={'ACL': 'public-read'})

spaces_client.delete_object(Bucket='merkoba', Key='test/hello4.test')
